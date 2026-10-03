# MAXSAGA — Taste the Epic

A storefront prototype for the MAXSAGA namkeen range: thirteen packs, every one ₹5/-,
with a working browser-side cart.

Built with HTML5, Tailwind CSS (play CDN) and vanilla JavaScript. No build step, no
dependencies, no backend — open `index.html` and it runs.

## Run it

```bash
open index.html            # straight off disk; everything is relative paths
# or, if you prefer a server:
python3 -m http.server 8000   # then visit http://localhost:8000
```

## What's in it

| Section | Behaviour |
|---|---|
| Hero | Brand lockup, "TASTE THE EPIC", and a kirana-style dangler fan of three packs |
| Trust row | Authentic Indian Namkeen · Epic Crunch & Flavor · Free Gift inside Dhamaaka packs |
| Filter bar | All Snacks / Rings / Sticks / Balls / Specialty Packets — filters in place, no reload |
| Product grid | 13 cards: packshot, name, shape, description, ₹5/-, veg mark, Add to Cart |
| Cart drawer | Slide-out panel, per-line +/−/remove, live ₹ subtotal, checkout |
| Footer | Newsletter signup with validation, social links |

The cart persists to `localStorage`, so it survives a reload. Checkout is simulated:
it shows an order summary with a locally generated reference and empties the cart.
Nothing is charged and nothing is sent anywhere.

## Layout

```
index.html                     page markup; a complete document, opens off disk
assets/
  MAXSAGA PRODUCTS.pdf         source artwork for the catalog and the packshots
  css/styles.css               brand tokens, pack devices, packshot treatment, motion
  img/*.webp                   13 packshots, cut out of the PDF onto transparency
  js/
    data.js                    the catalog — edit this to change the menu
    cart.js                    cart state: quantities, totals, localStorage, pub/sub
    app.js                     rendering, filtering, drawer, checkout
scripts/build-artifact.mjs     emits dist/index.html for publishing (see below)
```

### Editing the catalog

Everything about a product lives in `assets/js/data.js` — name, flavour, category,
price, description, pack colour and packshot. Add an object to `MAXSAGA_PRODUCTS`
and it appears in the grid and the filters automatically; nothing else needs changing.

Each product's `accent` is its own pack colour, sampled from the artwork. It drives
the card's hover glow and its background device, so the grid lights up in thirteen
real pack colours rather than one house accent. `device` picks which motif sits
behind the packshot, matching what is printed on that pack:

- `sunburst` — radiating spokes (the Rings packs)
- `rings` — nested concentric rings (the Sticks packs)
- `burst` — splash glow (the Balls and specialty packs)

### Where the product data came from

The catalog is transcribed from `assets/MAXSAGA PRODUCTS.pdf`. Product names, flavour
spellings, on-pack taglines ("Every Where Time Pass", "Free Gift with this pack") and
the ₹5/- price all follow the printed packaging. The packshots are the artwork from
that PDF, lifted off its white studio background and saved as WebP with transparency.

To swap in new photography, drop the file in `assets/img/` and point the product's
`image` at it — the card markup doesn't care where the picture comes from.

## Publishing

`index.html` is a full HTML document so it opens locally. Hosts that supply their own
page shell need the document wrapper removed:

```bash
node scripts/build-artifact.mjs    # writes dist/index.html
```

`dist/` is generated — edit `index.html`, never the file in `dist/`.
