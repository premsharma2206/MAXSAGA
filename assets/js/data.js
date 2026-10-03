/* ===========================================================================
   MAXSAGA — catalog data
   ---------------------------------------------------------------------------
   Transcribed from the official pack artwork in assets/MAXSAGA PRODUCTS.pdf.
   Thirteen packs, every one ₹5/-. Names, flavour spellings, on-pack taglines
   and the veg/NAMKEEN marks all follow the printed packaging.

   This is the only file you edit to change the menu. Nothing here touches the
   DOM: app.js renders whatever it finds in MAXSAGA_PRODUCTS, and cart.js looks
   products up by `id`.

   Field notes
     line        product line, printed on the pack
     flavour     flavour name as printed (null for the specialty packs, which
                 are their own brand rather than a flavour of a line)
     category    filter bucket — must match an id in MAXSAGA_CATEGORIES
     accent      the pack's own dominant colour, sampled from the artwork.
                 Drives the card glow and the backdrop device, so the grid
                 lights up in thirteen real pack colours rather than one
                 house accent.
     device      background motif printed on that pack: 'sunburst' (Rings),
                 'rings' (Sticks), 'burst' (Balls and the specialty packs)
     image       packshot cut out of the PDF onto transparency
     badge       on-pack flash, rendered on the card when present
   =========================================================================== */

(function () {
  'use strict';

  /* Every pack is a ₹5 single-serve. One constant so a price change is one
     edit rather than thirteen. */
  var PRICE = 5;

  /* Packshots are all 820px wide; heights differ per pack, so each product
     carries its own so the grid can reserve the right box and avoid layout
     shift while images load. */
  var IMG_W = 820;

  var MAXSAGA_CATEGORIES = [
    { id: 'all',       label: 'All Snacks' },
    { id: 'rings',     label: 'Rings' },
    { id: 'sticks',    label: 'Sticks' },
    { id: 'balls',     label: 'Balls' },
    { id: 'specialty', label: 'Specialty Packets' }
  ];

  var MAXSAGA_PRODUCTS = [
    /* ------------------------------ RINGS -------------------------------
       Black pack, colour sunburst behind a stack of golden corn rings. */
    {
      id: 'rings-chatpat',
      line: 'Maxsaga Rings',
      flavour: 'Chatpat Chattak',
      category: 'rings',
      shape: 'Hollow corn rings',
      accent: '#0C86D0',
      device: 'sunburst',
      image: 'assets/img/rings-chatpat.webp',
      imgW: IMG_W, imgH: 1154,
      price: PRICE,
      description: 'Featherlight corn rings tumbled in tangy chatpata masala — the kind that leaves your fingertips dusted and your hand going back for more.'
    },
    {
      id: 'rings-tomato',
      line: 'Maxsaga Rings',
      flavour: 'Masaledar Tomato',
      category: 'rings',
      shape: 'Hollow corn rings',
      accent: '#EE6A12',
      device: 'sunburst',
      image: 'assets/img/rings-tomato.webp',
      imgW: IMG_W, imgH: 1151,
      price: PRICE,
      description: 'Ripe tomato and red chilli dusted over airy rings. Sweet-sharp, deeply savoury, and gone in under a minute.'
    },
    {
      id: 'rings-cheese',
      line: 'Maxsaga Rings',
      flavour: 'Nawabi Cheese',
      category: 'rings',
      shape: 'Hollow corn rings',
      accent: '#9B27CE',
      device: 'sunburst',
      image: 'assets/img/rings-cheese.webp',
      imgW: IMG_W, imgH: 1155,
      price: PRICE,
      description: 'Nawabi cheese seasoning melts onto the crunch the moment it hits your tongue. Rich, buttery, unapologetically cheesy.'
    },

    /* ------------------------------ STICKS ------------------------------
       Concentric ring pack with a heap of seasoned crunch sticks. */
    {
      id: 'sticks-chatpat',
      line: 'Maxsaga Sticks',
      flavour: 'Chatpat Chattak',
      category: 'sticks',
      shape: 'Long crunch sticks',
      accent: '#A85B2A',
      device: 'rings',
      image: 'assets/img/sticks-chatpat.webp',
      imgW: IMG_W, imgH: 1155,
      price: PRICE,
      description: 'Finger-length sticks with a serious snap, loaded with chatpat chattak masala. Built for sharing, impossible to share.'
    },
    {
      id: 'sticks-cheese',
      line: 'Maxsaga Sticks',
      flavour: 'Nawabi Cheese',
      category: 'sticks',
      shape: 'Long crunch sticks',
      accent: '#00A341',
      device: 'rings',
      image: 'assets/img/sticks-cheese.webp',
      imgW: IMG_W, imgH: 1153,
      price: PRICE,
      description: 'Golden sticks blanketed in Nawabi cheese. Crisp on the outside, cloud-light inside, savoury all the way down.'
    },
    {
      id: 'sticks-tomato',
      line: 'Maxsaga Sticks',
      flavour: 'Masaledar Tomato',
      category: 'sticks',
      shape: 'Long crunch sticks',
      accent: '#E0157A',
      device: 'rings',
      image: 'assets/img/sticks-tomato.webp',
      imgW: IMG_W, imgH: 1146,
      price: PRICE,
      description: 'Masaledar tomato on a stick that crunches back. Tangy, fiery and dangerously snackable.'
    },

    /* ------------------------------- BALLS ------------------------------
       Splash-art pack: puffed balls erupting out of a cheese burst. */
    {
      id: 'balls-cheese',
      line: 'Maxsaga Balls',
      flavour: 'Nawabi Cheese',
      category: 'balls',
      shape: 'Puffed round balls',
      accent: '#2BA6E0',
      device: 'burst',
      image: 'assets/img/balls-cheese.webp',
      imgW: IMG_W, imgH: 1107,
      price: PRICE,
      description: 'Puffed spheres that collapse into molten cheese flavour on the first bite. The one everyone fights over.'
    },
    {
      id: 'balls-chatpat',
      line: 'Maxsaga Balls',
      flavour: 'Chatpat Chattak',
      category: 'balls',
      shape: 'Puffed round balls',
      accent: '#8A97A6',
      device: 'burst',
      image: 'assets/img/balls-chatpat.webp',
      imgW: IMG_W, imgH: 1111,
      price: PRICE,
      description: 'Bite-size puffs rolled in chatpata masala. Tangy hit first, roasted spice after, crunch throughout.'
    },
    {
      id: 'balls-tomato',
      line: 'Maxsaga Balls',
      flavour: 'Masaledar Tomato',
      category: 'balls',
      shape: 'Puffed round balls',
      accent: '#EE4423',
      device: 'burst',
      image: 'assets/img/balls-tomato.webp',
      imgW: IMG_W, imgH: 1111,
      price: PRICE,
      description: 'Round, airy and drenched in masaledar tomato. Pops in the mouth, lingers on the tongue.'
    },

    /* ---------------------------- SPECIALTY -----------------------------
       Each of these is its own pack identity rather than a flavour of a
       line, so `flavour` is null and the name carries the pack. */
    {
      id: 'hot-chilli-wheels',
      line: 'Hot Wheels',
      flavour: null,
      category: 'specialty',
      shape: 'Hot Chilli Wheels',
      accent: '#E8221C',
      device: 'burst',
      image: 'assets/img/hot-chilli-wheels.webp',
      imgW: IMG_W, imgH: 1198,
      price: PRICE,
      tagline: 'Every Where Time Pass',
      description: 'Little spoked wheels with a chilli burn that creeps up on you. The original every-where time pass.'
    },
    {
      id: 'spicy-pasta',
      line: 'Spicy Pasta',
      flavour: null,
      category: 'specialty',
      shape: 'Fried pasta pieces',
      accent: '#F26A12',
      device: 'burst',
      image: 'assets/img/spicy-pasta.webp',
      imgW: IMG_W, imgH: 1183,
      price: PRICE,
      tagline: 'Tasty Snacks',
      description: 'Real pasta, fried crisp and tossed with tomato, onion and chilli. Crunchy, spicy and strangely addictive.'
    },
    {
      id: 'polo-ring',
      line: 'Polo Ring',
      flavour: null,
      category: 'specialty',
      shape: 'Thick puffed rings',
      accent: '#19A64B',
      device: 'burst',
      image: 'assets/img/polo-ring.webp',
      imgW: IMG_W, imgH: 1181,
      price: PRICE,
      description: 'Chunky golden rings with a light salted crunch. Stack them on your fingers before you eat them — everybody does.'
    },
    {
      id: 'dhamaaka-boom',
      line: 'Dhamaaka Boom',
      flavour: null,
      category: 'specialty',
      shape: 'Snack pack with a toy',
      accent: '#C01477',
      device: 'burst',
      image: 'assets/img/dhamaaka-boom.webp',
      imgW: IMG_W, imgH: 1201,
      price: PRICE,
      badge: 'Free Gift with this pack',
      note: 'Just play with the toy — don’t eat it.',
      description: 'Crunch plus a surprise toy in every pack — spinners, planes, drums, mixer trucks. The one kids ask for by name.'
    }
  ];

  window.MAXSAGA_CATEGORIES = MAXSAGA_CATEGORIES;
  window.MAXSAGA_PRODUCTS = MAXSAGA_PRODUCTS;
})();
