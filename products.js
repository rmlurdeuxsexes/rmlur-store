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
    cover: "assets/covers/midnight-pager.jpg",
    preview: "previews/midnight-pager.mp3",
    stripeLink: "https://buy.stripe.com/REPLACE_ME",
    tags: ["dark", "boom bap", "vinyl"]
  },
  {
    id: "deux-sexes-drums-v1",
    type: "kit",
    title: "DEUX SEXES DRUMS V1",
    subtitle: "mpc2000xl one-shots • 90 sounds",
    bpm: null,
    key: null,
    price: 24.99,
    cover: "assets/covers/deux-sexes-drums-v1.jpg",
    preview: "previews/deux-sexes-drums-v1.mp3",
    stripeLink: "https://buy.stripe.com/REPLACE_ME",
    tags: ["drum kit", "one shots", "12-bit"]
  },
  {
    id: "getty-tape",
    type: "beat",
    title: "GETTY TAPE",
    subtitle: "smooth soul flip",
    bpm: 74,
    key: "Bbmaj",
    price: 34.99,
    cover: "assets/covers/getty-tape.jpg",
    preview: "previews/getty-tape.mp3",
    stripeLink: "https://buy.stripe.com/REPLACE_ME",
    tags: ["soul", "sample", "chops"]
  }
];
