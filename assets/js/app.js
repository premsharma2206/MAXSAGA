/* ===========================================================================
   MAXSAGA — UI
   ---------------------------------------------------------------------------
   Renders the catalog, runs the filter bar, and drives the cart drawer.

   The one rule that keeps this simple: nothing here stores cart state. Every
   piece of cart UI — the header badge, the drawer, the add buttons — redraws
   from the MaxCart.subscribe callback at the bottom of this file, so there is
   never a second copy of the truth to keep in sync.
   =========================================================================== */

(function () {
  'use strict';

  var PRODUCTS = window.MAXSAGA_PRODUCTS || [];
  var CATEGORIES = window.MAXSAGA_CATEGORIES || [];
  var Cart = window.MaxCart;

  /* ---- Helpers ---------------------------------------------------------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* Catalog copy is ours, but it still goes through the DOM as text rather
     than markup so an apostrophe or an ampersand in a flavour name can never
     break the page. */
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function inr(amount) { return '₹' + amount; }

  /* ---- Element handles --------------------------------------------------- */

  var grid = $('#product-grid');
  var filterBar = $('#filter-bar');
  var resultCount = $('#result-count');
  var emptyState = $('#empty-state');

  var cartButton = $('#cart-button');
  var cartCount = $('#cart-count');

  var drawer = $('#drawer');
  var backdrop = $('#drawer-backdrop');
  var cartLines = $('#cart-lines');
  var cartEmpty = $('#cart-empty');
  var cartFoot = $('#cart-foot');
  var cartSubtotal = $('#cart-subtotal');
  var cartUnits = $('#cart-units');
  var orderConfirm = $('#order-confirm');

  var toast = $('#toast');
  var toastText = $('#toast-text');

  /* =========================================================================
     1. Product grid
     ========================================================================= */

  function cardMarkup(product) {
    /* The pack's own colour drives the card glow and its background device,
       so it is set once here as a custom property on the card. */
    var style = '--accent:' + esc(product.accent) + ';';

    /* Specialty packs carry their own identity rather than a flavour of a
       line, so the title falls back to the line name. */
    var title = product.flavour || product.line;
    var eyebrow = product.flavour ? product.line : (product.tagline || 'Maxsaga');

    var badge = product.badge
      ? '<span class="gift-badge label inline-block rounded px-2 py-1 text-[0.6rem]">' + esc(product.badge) + '</span>'
      : '';

    var note = product.note
      ? '<p class="mt-2 text-xs text-[color:var(--foil-dim)]">' + esc(product.note) + '</p>'
      : '';

    return '' +
      '<article class="card" data-category="' + esc(product.category) + '" style="' + style + '">' +
        '<div class="shot">' +
          '<div class="device device--' + esc(product.device) + '" aria-hidden="true"></div>' +
          '<div class="shot__flash flash" aria-hidden="true">' +
            '<span><span class="flash__amount">₹5</span><br><span class="flash__unit">ONLY</span></span>' +
          '</div>' +
          '<img class="shot__img" src="' + esc(product.image) + '" ' +
               'width="' + esc(product.imgW) + '" height="' + esc(product.imgH) + '" ' +
               'loading="lazy" decoding="async" ' +
               'alt="' + esc(product.line + (product.flavour ? ' ' + product.flavour : '') + ' pack') + '">' +
        '</div>' +

        '<div class="flex flex-1 flex-col gap-3 p-5 pt-3">' +
          '<div class="flex items-start justify-between gap-3">' +
            '<div>' +
              '<p class="label text-[0.58rem] text-[color:var(--foil-dim)]">' + esc(eyebrow) + '</p>' +
              '<h3 class="font-display mt-1 text-lg leading-tight">' + esc(title) + '</h3>' +
            '</div>' +
            '<span class="veg-mark mt-1 text-base" title="Vegetarian" aria-label="Vegetarian"></span>' +
          '</div>' +

          '<p class="text-sm leading-relaxed text-[color:var(--foil-dim)]">' + esc(product.description) + '</p>' +
          note +

          '<div class="mt-auto flex items-center justify-between gap-3 pt-2">' +
            '<div>' +
              '<p class="font-display tabular text-xl">' + inr(product.price) + '/-</p>' +
              '<p class="label text-[0.52rem] text-[color:var(--foil-dim)]">' + esc(product.shape) + '</p>' +
            '</div>' +
            badge +
          '</div>' +

          '<button type="button" class="btn-add label w-full rounded-xl px-4 py-3 text-[0.68rem]" ' +
                  'data-add="' + esc(product.id) + '">Add to Cart</button>' +
        '</div>' +
      '</article>';
  }

  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map(cardMarkup).join('');
  }

  /* One delegated listener covers all thirteen add buttons. */
  function wireGrid() {
    if (!grid) return;
    grid.addEventListener('click', function (event) {
      var button = event.target.closest('[data-add]');
      if (!button) return;
      Cart.add(button.getAttribute('data-add'));
    });
  }

  /* =========================================================================
     2. Filter bar
     ========================================================================= */

  var activeFilter = 'all';

  function renderFilters() {
    if (!filterBar) return;
    filterBar.innerHTML = CATEGORIES.map(function (category) {
      var pressed = category.id === activeFilter;
      return '<button type="button" class="filter-btn label shrink-0 rounded-full px-5 py-3 text-[0.62rem]" ' +
             'data-filter="' + esc(category.id) + '" aria-pressed="' + pressed + '">' +
             esc(category.label) + '</button>';
    }).join('');
  }

  /* Cards are hidden in place rather than re-rendered, so filtering never
     reloads an image or drops a card's hover state. */
  function applyFilter(categoryId) {
    activeFilter = categoryId;

    var shown = 0;
    $$('.card', grid).forEach(function (card) {
      var match = categoryId === 'all' || card.getAttribute('data-category') === categoryId;
      card.hidden = !match;
      if (match) shown++;
    });

    $$('[data-filter]', filterBar).forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === categoryId));
    });

    if (resultCount) {
      resultCount.textContent = shown + (shown === 1 ? ' pack' : ' packs');
    }
    if (emptyState) emptyState.hidden = shown !== 0;
  }

  function wireFilters() {
    if (!filterBar) return;
    filterBar.addEventListener('click', function (event) {
      var button = event.target.closest('[data-filter]');
      if (!button) return;
      applyFilter(button.getAttribute('data-filter'));
    });
  }

  /* =========================================================================
     3. Cart drawer
     ========================================================================= */

  var lastFocused = null;

  function drawerIsOpen() {
    return document.body.classList.contains('drawer-open');
  }

  function focusables() {
    return $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', drawer)
      .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
  }

  /* `trigger` is the control that opened the panel; focus returns to it on
     close. It is passed explicitly rather than read from document.activeElement
     because the drawer is also opened programmatically, when a click lands on a
     card's add button rather than on the cart button itself. */
  function openDrawer(trigger) {
    if (drawerIsOpen()) return;
    lastFocused = trigger || document.activeElement;
    document.body.classList.add('drawer-open');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.setAttribute('aria-hidden', 'false');

    // Wait for the panel to become visible before moving focus into it.
    window.setTimeout(function () {
      var first = focusables()[0];
      if (first) first.focus();
    }, 60);
  }

  function closeDrawer() {
    if (!drawerIsOpen()) return;
    document.body.classList.remove('drawer-open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('aria-hidden', 'true');

    // Fall back to the cart button if the original trigger has since gone.
    var returnTo = (lastFocused && document.contains(lastFocused)) ? lastFocused : cartButton;
    if (returnTo && returnTo.focus) returnTo.focus();
  }

  function lineMarkup(line) {
    var product = line.product;
    var title = product.flavour ? product.flavour : product.line;
    var sub = product.flavour ? product.line : product.shape;

    return '' +
      '<li class="flex gap-3 border-b border-[color:var(--hairline)] pb-4" style="--accent:' + esc(product.accent) + '">' +
        '<div class="thumb h-20 w-16 shrink-0">' +
          '<div class="device device--' + esc(product.device) + '" aria-hidden="true"></div>' +
          '<img src="' + esc(product.image) + '" alt="" loading="lazy" decoding="async">' +
        '</div>' +

        '<div class="min-w-0 flex-1">' +
          '<p class="font-display text-sm leading-tight">' + esc(title) + '</p>' +
          '<p class="label text-[0.5rem] text-[color:var(--foil-dim)]">' + esc(sub) + '</p>' +
          '<p class="tabular mt-1 text-xs text-[color:var(--foil-dim)]">' + inr(product.price) + '/- each</p>' +

          '<div class="mt-2 flex items-center gap-2">' +
            '<button type="button" class="qty-btn" data-dec="' + esc(product.id) + '" ' +
                    'aria-label="Decrease quantity of ' + esc(title) + '">−</button>' +
            '<span class="tabular w-8 text-center text-sm" aria-live="polite">' + line.qty + '</span>' +
            '<button type="button" class="qty-btn" data-inc="' + esc(product.id) + '" ' +
                    'aria-label="Increase quantity of ' + esc(title) + '">+</button>' +
            '<button type="button" class="label ml-auto text-[0.52rem] text-[color:var(--foil-dim)] underline underline-offset-4 hover:text-[color:var(--red)]" ' +
                    'data-remove="' + esc(product.id) + '">Remove</button>' +
          '</div>' +
        '</div>' +

        '<p class="font-display tabular shrink-0 text-sm">' + inr(line.lineTotal) + '</p>' +
      '</li>';
  }

  function renderDrawer() {
    if (!cartLines) return;

    var lines = Cart.lines();
    var empty = lines.length === 0;

    cartLines.innerHTML = lines.map(lineMarkup).join('');
    cartLines.hidden = empty;
    if (cartEmpty) cartEmpty.hidden = !empty;
    if (cartFoot) cartFoot.hidden = empty;

    var units = Cart.count();
    if (cartSubtotal) cartSubtotal.textContent = inr(Cart.subtotal());
    if (cartUnits) cartUnits.textContent = units + (units === 1 ? ' pack' : ' packs');
  }

  function wireDrawer() {
    if (cartButton) {
      cartButton.addEventListener('click', function () {
        showCartView();
        openDrawer(cartButton);
      });
    }

    $$('[data-close-drawer]').forEach(function (el) {
      el.addEventListener('click', closeDrawer);
    });

    /* Quantity controls, delegated so they survive every re-render. */
    cartLines.addEventListener('click', function (event) {
      var inc = event.target.closest('[data-inc]');
      var dec = event.target.closest('[data-dec]');
      var rm = event.target.closest('[data-remove]');

      if (inc) Cart.increment(inc.getAttribute('data-inc'));
      else if (dec) Cart.decrement(dec.getAttribute('data-dec'));
      else if (rm) Cart.remove(rm.getAttribute('data-remove'));
    });

    document.addEventListener('keydown', function (event) {
      if (!drawerIsOpen()) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
        return;
      }

      /* Keep Tab inside the panel while it is open. */
      if (event.key !== 'Tab') return;
      var items = focusables();
      if (items.length === 0) return;

      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* =========================================================================
     4. Checkout — prototype only, no payment and no server
     ========================================================================= */

  function showCartView() {
    if (orderConfirm) orderConfirm.hidden = true;
    if (cartLines) cartLines.hidden = Cart.isEmpty();
    if (cartEmpty) cartEmpty.hidden = !Cart.isEmpty();
    if (cartFoot) cartFoot.hidden = Cart.isEmpty();
  }

  function wireCheckout() {
    var checkout = $('#checkout-btn');
    var keepShopping = $('#keep-shopping');

    if (checkout) {
      checkout.addEventListener('click', function () {
        if (Cart.isEmpty()) return;

        var units = Cart.count();
        var total = Cart.subtotal();
        var reference = 'MX' + String(Date.now()).slice(-6);

        $('#order-id').textContent = reference;
        $('#order-total').textContent = inr(total);
        $('#order-units').textContent = units + (units === 1 ? ' pack' : ' packs');

        Cart.clear();                       // re-renders the (now empty) list

        cartLines.hidden = true;
        if (cartEmpty) cartEmpty.hidden = true;
        if (cartFoot) cartFoot.hidden = true;
        orderConfirm.hidden = false;
      });
    }

    if (keepShopping) {
      keepShopping.addEventListener('click', function () {
        showCartView();
        closeDrawer();
      });
    }
  }

  /* =========================================================================
     5. Feedback — badge, toast, button state
     ========================================================================= */

  var toastTimer = null;

  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('is-visible');

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2600);
  }

  function flashAddButton(productId) {
    var button = grid && grid.querySelector('[data-add="' + productId + '"]');
    if (!button) return;

    button.classList.add('is-added');
    button.textContent = 'Added ✓';

    window.clearTimeout(button._resetTimer);
    button._resetTimer = window.setTimeout(function () {
      button.classList.remove('is-added');
      button.textContent = 'Add to Cart';
    }, 1300);
  }

  function renderBadge() {
    if (!cartCount) return;
    var units = Cart.count();

    cartCount.textContent = units;
    cartCount.hidden = units === 0;

    // Restart the pop by removing and re-adding on the next frame.
    cartCount.classList.remove('badge-pop');
    void cartCount.offsetWidth;
    if (units > 0) cartCount.classList.add('badge-pop');
  }

  /* =========================================================================
     6. Newsletter — validated in the browser, no network call
     ========================================================================= */

  function wireNewsletter() {
    var form = $('#newsletter-form');
    if (!form) return;

    var input = $('#newsletter-email');
    var message = $('#newsletter-msg');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        message.textContent = 'That email address looks incomplete — check it and try again.';
        message.style.color = 'var(--red)';
        input.focus();
        return;
      }

      message.textContent = 'You’re in. Epic drops and new flavours are headed your way.';
      message.style.color = 'var(--veg)';
      form.reset();
    });
  }

  /* =========================================================================
     7. Scroll reveal
     ========================================================================= */

  function wireReveal() {
    var targets = $$('.reveal');
    if (targets.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* =========================================================================
     8. Hero dangler strip — three packs hanging like a kirana shop strip
     ========================================================================= */

  function renderDanglers() {
    var strip = $('#hero-danglers');
    if (!strip) return;

    var picks = ['rings-chatpat', 'balls-cheese', 'dhamaaka-boom']
      .map(function (id) {
        for (var i = 0; i < PRODUCTS.length; i++) {
          if (PRODUCTS[i].id === id) return PRODUCTS[i];
        }
        return null;
      })
      .filter(Boolean);

    /* Slot widths and tilts live in styles.css (.dangler__slot:nth-child),
       so the fan can be recomposed without touching this file. */
    strip.innerHTML = picks.map(function (product) {
      return '<div class="dangler__slot">' +
               '<img class="dangler__pack" src="' + esc(product.image) + '" ' +
                    'width="' + esc(product.imgW) + '" height="' + esc(product.imgH) + '" ' +
                    'decoding="async" alt="' + esc(product.line) + ' pack">' +
             '</div>';
    }).join('');
  }

  /* =========================================================================
     Boot
     ========================================================================= */

  function init() {
    renderGrid();
    renderFilters();
    renderDanglers();
    wireGrid();
    wireFilters();
    wireDrawer();
    wireCheckout();
    wireNewsletter();
    wireReveal();

    applyFilter('all');

    /* Every piece of cart UI redraws from here, and only from here. */
    Cart.subscribe(function (event) {
      renderBadge();
      renderDrawer();

      if (event.type === 'add' && event.product) {
        var name = event.product.flavour
          ? event.product.flavour + ' ' + event.product.line.replace(/^Maxsaga /, '')
          : event.product.line;
        showToast(name + ' added to your cart');
        flashAddButton(event.id);
        showCartView();
      }
    });

    // Paint the initial state, including a cart restored from a previous visit.
    renderBadge();
    renderDrawer();

    var year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
