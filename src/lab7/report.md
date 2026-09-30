# Courtly implementation report

## Deliverables

- `index.html` contains the complete Ukrainian Courtly landing page and accessible mobile navigation.
- `styles.css` contains the supplied design-token block followed by all page styling.
- All photos, the logo, and favicon are loaded from `courtly-assets/`.

## Layout and responsive decisions

- Used a mobile-first layout with the specified `40rem` (640px), `48rem` (768px), and `64rem` (1024px) media-query thresholds.
- Mobile uses a menu button and one-column search/cards/steps/footer. Tablet uses a two-column search, venue grid, and footer; the about section becomes two columns at 768px. Desktop shows inline navigation, a five-control search row, three venue columns, three steps, and a four-column footer.
- At desktop, Arena Sport spans two columns and two rows and changes to a two-column featured card. Its benefits and available time slots are hidden on smaller screens; the featured badge remains visible at every size.
- Added a keyboard-operable menu with `aria-expanded`, a changing accessible name, Escape-to-close behavior, and automatic closure after following a menu link.
- Used the required section IDs (`search`, `venues`, `how`, `about`, `contacts`) and linked the header and hero calls to action to `#venues`; the final call to action links to `#search`.
- The demo search form has the required city, sport, and date fields, associated labels and native validation; the six venue actions are buttons with distinct accessible names.
- Benefit headings use valid `h3` markup inside block containers. Step spacing follows the spec: 8 px between number and heading, 12 px between heading and text.
- The form uses Flexbox with wrapping; venue cards use CSS Grid at the specified 1/2/3-column breakpoints. The focus token is overridden on the dark CTA and footer containers so their focus indicators inherit the accent color.

## Design tokens and assets

- Copied the token declarations from `courtly-assets/tokens.css` without changing their names or values. No additional CSS custom properties were introduced.
- Montserrat is loaded with the Latin and Cyrillic subsets through Google Fonts. The existing token family provides system fallbacks if the network font is unavailable.
- The hero uses the provided responsive `srcset`, intrinsic dimensions, and high fetch priority. Other page photos use intrinsic dimensions and lazy loading; descriptive alternatives are included. The featured venue uses the supplied portrait image and crops to 4:3 below desktop.
- The about photo now serves a 384 × 480 WebP candidate (6.2 KB) for mobile displays and retains the original 960 × 1200 image for larger/high-density displays. The smaller file is about 72% lighter than the original.
- Google Fonts remains external as requested; its stylesheet/font requests and the page stylesheet can still appear in Lighthouse's render-blocking/third-party diagnostics.
- The favicon and logo use their supplied SVG assets. Canonical, Open Graph, `robots.txt`, and `sitemap.xml` target the confirmed deployment at `https://webdev-lab7.vercel.app/`.

## Scope

Search controls and venue links are front-end presentation only. The form submits to the venue section; no booking service or search backend was provided.

## Audit and submission status

- The PDF audit found and corrected mismatched anchors/IDs, incomplete form options and validation, non-button venue actions, missing unique action names, grid-based search layout, incorrect dark-section focus overrides, missing canonical/Open Graph URL metadata, and missing sitemap/robots files.
- Canonical, Open Graph, `robots.txt`, and sitemap URLs match `https://webdev-lab7.vercel.app/`. A cache-busted live check on 2026-09-30 confirmed the crawler files use this URL; the Open Graph image responds with HTTP 200. The live page has the responsive about-image `srcset`, but still serves the older benefit-heading wrappers and step spacing; redeploy the latest local HTML/CSS before final submission.
- AI assistance: GitHub Copilot in VS Code was used to implement and audit the page. The model identifier is not exposed in this environment, so it is not guessed. All identified code-level findings were corrected; publication-dependent checks remain open.
- Submission links: repository `https://github.com/illiadavydiuk7/WebDev`; published page `https://webdev-lab7.vercel.app/`.
- The Lighthouse text supplied in chat reports Accessibility, Best Practices, and SEO scores of 100 on 2026-09-30 (Moto G Power, Lighthouse 13.4.1, Chrome 154, Slow 4G). It predates the latest local changes; the supplied text does not confirm Incognito/InPrivate mode. Rerun Mobile Navigation after redeploy. The Lighthouse screenshot itself is not saved in this workspace and must be attached to the email.
