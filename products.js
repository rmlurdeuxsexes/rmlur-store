/* ============================================================
   RMLUR STORE — PRODUCT CATALOG
   ============================================================
   To add a new beat or kit:
   1. Drop cover art into  assets/covers/   (jpg or png)
   2. Drop mp3 preview into  previews/      (tagged preview!)
   3. Copy one of the blocks below, edit it, done.
   4. Push to GitHub → site updates automatically.

   "stripeLink" = your Stripe Payment Link for that product.
   Create at: dashboard.stripe.com → Payment Links → New
   (one-time payment, attach Dropbox delivery link in the
   confirmation email / receipt — see README-SETUP.md)
   ============================================================ */

window.PRODUCTS = [
  {
    id: "midnight-pager",
    type: "beat",            // "beat" or "kit"
    title: "MIDNIGHT PAGER",
    subtitle: "griselda type beat",
    bpm: 87,
    key: "F#m",
    price: 34.99,
    cover: "assets/midnight-pager.jpg",
    preview: "previews/midnight-pager.mp3",
    stripeLink: "https://buy.stripe.com/REPLACE_ME",
    tags: ["dark", "boom bap", "vinyl"],
    hotspot: "tape"           // the MidKnight tape graphic on the hero photo
  },
  {
    id: "deux-sexes-drums-v1",
    type: "kit",
    title: "DEUX SEXES DRUMS V1",
    subtitle: "mpc2000xl one-shots • 90 sounds",
    bpm: null,
    key: null,
    price: 24.99,
    cover: "assets/deux-sexes-drums-v1.jpg",
    preview: "previews/deux-sexes-drums-v1.mp3",
    stripeLink: "https://buy.stripe.com/REPLACE_ME",
    tags: ["drum kit", "one shots", "12-bit"],
    hotspot: "pad-0-1"        // pad row 1, col 2 on the hero photo
  },
  {
    id: "getty-tape",
    type: "beat",
    title: "GETTY TAPE",
    subtitle: "smooth soul flip",
    bpm: 74,
    key: "Bbmaj",
    price: 34.99,
    cover: "assets/getty-tape.jpg",
    preview: "previews/getty-tape.mp3",
    stripeLink: "https://buy.stripe.com/REPLACE_ME",
    tags: ["soul", "sample", "chops"],
    hotspot: "pad-0-2"        // pad row 1, col 3 on the hero photo
  }
];

/* ============================================================
   HERO HOTSPOT MAP — pixel coordinates on assets/hero/mpc-hero.jpg
   (760 x 690 source image). Percentages so it scales responsively.
   Add a new pad-r-c entry here if you map a new product to a pad.
   ============================================================ */
window.HERO_HOTSPOTS = {
  "pad-0-0": { left: 59.5, top: 27.8, width: 9.2, height: 8.7 },
  "pad-0-1": { left: 68.7, top: 27.8, width: 9.2, height: 8.7 },
  "pad-0-2": { left: 77.9, top: 27.8, width: 9.2, height: 8.7 },
  "pad-0-3": { left: 87.1, top: 27.8, width: 9.2, height: 8.7 },
  "tape":    { left: 20.8, top: 69.3, width: 17.6, height: 26.4 }
};
