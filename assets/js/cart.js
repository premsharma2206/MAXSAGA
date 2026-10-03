/* ===========================================================================
   MAXSAGA — cart state
   ---------------------------------------------------------------------------
   The single owner of cart state. Deliberately DOM-free: it stores quantities,
   persists them, and notifies subscribers. Everything visible — the header
   badge, the drawer, the card buttons — re-renders from the `subscribe`
   callback in app.js, so there is exactly one source of truth.

   All prices are whole rupees, so totals are integer arithmetic throughout.
   =========================================================================== */

window.MaxCart = (function () {
  'use strict';

  var STORAGE_KEY = 'maxsaga.cart.v1';
  var MAX_QTY = 99;                 // keeps a stuck "+" key from running away

  /* Map<productId, qty>. A Map keeps insertion order, so the drawer doesn't
     reshuffle its lines every time a quantity changes. */
  var items = new Map();
  var listeners = [];

  /* ---- Catalog lookup ---------------------------------------------------- */

  function catalog() {
    return window.MAXSAGA_PRODUCTS || [];
  }

  function findProduct(id) {
    var all = catalog();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  }

  /* ---- Persistence ------------------------------------------------------
     localStorage can throw outright (Safari private mode, blocked site data),
     so every read and write is guarded. A cart that can't be saved still
     works for the session — it just won't survive a reload. */

  function load() {
    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return;
    }
    if (!raw) return;

    try {
      var saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object') return;

      Object.keys(saved).forEach(function (id) {
        var qty = parseInt(saved[id], 10);
        // Drop ids that are no longer in the catalog: a stale saved cart must
        // never be able to break rendering.
        if (!findProduct(id)) return;
        if (!isFinite(qty) || qty < 1) return;
        items.set(id, Math.min(qty, MAX_QTY));
      });
    } catch (err) {
      /* Corrupt payload — start with an empty cart rather than failing. */
    }
  }

  function save() {
    var plain = {};
    items.forEach(function (qty, id) { plain[id] = qty; });
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plain));
    } catch (err) {
      /* Storage full or unavailable — in-memory state is still correct. */
    }
  }

  /* ---- Change notification ---------------------------------------------- */

  function emit(detail) {
    save();
    var payload = detail || {};
    listeners.forEach(function (fn) {
      try {
        fn(payload);
      } catch (err) {
        // One broken subscriber must not stop the others from updating.
        console.error('MaxCart subscriber failed', err);
      }
    });
  }

  /* ---- Mutations --------------------------------------------------------- */

  function add(id, qty) {
    var product = findProduct(id);
    if (!product) return false;

    var step = parseInt(qty, 10);
    if (!isFinite(step) || step < 1) step = 1;

    var next = Math.min((items.get(id) || 0) + step, MAX_QTY);
    items.set(id, next);
    emit({ type: 'add', id: id, product: product, qty: next });
    return true;
  }

  function setQty(id, qty) {
    if (!items.has(id)) return false;

    var next = parseInt(qty, 10);
    if (!isFinite(next) || next < 1) return remove(id);

    items.set(id, Math.min(next, MAX_QTY));
    emit({ type: 'qty', id: id, qty: items.get(id) });
    return true;
  }

  function increment(id) {
    return items.has(id) ? setQty(id, items.get(id) + 1) : add(id, 1);
  }

  /* Stepping down from 1 removes the line — the "−" button doubles as a
     remove at the bottom of its range, which is what shoppers expect. */
  function decrement(id) {
    if (!items.has(id)) return false;
    var current = items.get(id);
    return current <= 1 ? remove(id) : setQty(id, current - 1);
  }

  function remove(id) {
    if (!items.has(id)) return false;
    var product = findProduct(id);
    items.delete(id);
    emit({ type: 'remove', id: id, product: product });
    return true;
  }

  function clear() {
    if (items.size === 0) return false;
    items.clear();
    emit({ type: 'clear' });
    return true;
  }

  /* ---- Reads ------------------------------------------------------------- */

  /* Joins stored quantities against the catalog. Returns fully-formed lines so
     the drawer never has to look a product up itself. */
  function lines() {
    var out = [];
    items.forEach(function (qty, id) {
      var product = findProduct(id);
      if (!product) return;
      out.push({ product: product, qty: qty, lineTotal: product.price * qty });
    });
    return out;
  }

  function qtyOf(id) {
    return items.get(id) || 0;
  }

  /* Total units — this is what the header badge shows. */
  function count() {
    var total = 0;
    items.forEach(function (qty) { total += qty; });
    return total;
  }

  function subtotal() {
    return lines().reduce(function (sum, line) { return sum + line.lineTotal; }, 0);
  }

  function isEmpty() {
    return items.size === 0;
  }

  /* ---- Subscription ----------------------------------------------------- */

  function subscribe(fn) {
    if (typeof fn !== 'function') return function () {};
    listeners.push(fn);
    return function unsubscribe() {
      var i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

  load();

  return {
    add: add,
    setQty: setQty,
    increment: increment,
    decrement: decrement,
    remove: remove,
    clear: clear,
    lines: lines,
    qtyOf: qtyOf,
    count: count,
    subtotal: subtotal,
    isEmpty: isEmpty,
    subscribe: subscribe
  };
})();
