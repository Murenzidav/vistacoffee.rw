# Vista Coffee website

Static, mobile-first website (HTML/CSS/vanilla JS). No server or framework required.

## Editing
- Edit pages in `src/pages/`, the shared header/footer in `src/partials/`, then run:
  `python3 build.py`  → regenerates the `.html` files in this folder and `js/search-index.js`.
- Do not edit the root `.html` files directly; they are overwritten on each build.
- Styles: `css/style.css` (colours and fonts are tokens at the top).
- News posts: `js/news-data.js` (no build needed). The 3 sample posts are marked as placeholders.

## Before launch
- Contact page: replace `[ADD NUMBER]` and `[ADD HOURS]` in `src/pages/contact.html`.
- Footer: add real social media URLs (currently `#`) in `src/partials/footer.html`.
- Forms use FormSubmit (formsubmit.co). The first submission sends an activation email to
  sales@vistagroup.com; click the link once, and all later inquiries will be delivered.
- Privacy Policy and Terms are short drafts. Have them reviewed.
- Photos are free stock (Unsplash licence) and public-domain images (Wikimedia Commons / WordPress
  Photo Directory / Flickr). The "green-beans" photo is a recoloured bean photo. Replace with real Vista Coffee
  photography when available (same file names in `images/`, `name.webp` 1600px + `name-sm.webp` 800px).

## Preview locally
`npm run dev` (or `python3 -m http.server 8000`), then open http://localhost:8000
# vistacoffee.rw
