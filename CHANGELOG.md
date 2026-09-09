# Changelog

## 2.0.1 — 2026-09-09

### Fixed
- `[hidden]` was overridden by component `display` rules, so hidden form messages and the
  buy-button error box rendered permanently.
- Reveal-on-scroll could leave whole sections invisible when IntersectionObserver dropped
  entries during fast scrolling. A throttled scroll/resize sweep now backs it up.
- `.banner__content` never centred — `justify-items` places children, not the block.
- The desktop product gallery rendered as a peeking mobile carousel; it now stacks or
  grids from 990px up.
- A filter used inside a `form` tag argument in `localization-form.liquid`, which newer
  Shopify CLI versions reject as a syntax error.

## 2.0.0 — 2026-09-08

Complete rewrite. Nothing is shared with 1.x apart from the name and the general
fashion-storefront intent.

### Added
- Theme-blocks architecture (`blocks/`), matching the current Shopify theme generation.
- JSON templates for all 12 required templates plus 7 customer templates.
- Header and footer section groups.
- 4 editable colour schemes with a per-section colour scheme picker; 2 theme presets.
- Ajax cart drawer, quick add from product cards, and predictive search.
- Storefront filtering and sorting driven by Search & Discovery.
- Product page composed of rearrangeable blocks (title, price, variant picker,
  quantity, buy buttons, inventory, description, collapsible rows).
- Native swatch support from Shopify product option values.
- Product and BlogPosting JSON-LD.
- Shopify Markets country/currency and language selectors.
- Full storefront translation coverage in `locales/en.default.json` (213 strings).
- Full theme-editor translation coverage in `locales/en.default.schema.json` (386 strings)
  — every section, block, preset and setting label, info string and select option.

### Removed
- jQuery 3.2.1, Bootstrap 4, Popper, Slick, Owl Carousel, bxSlider, Animsition,
  Select2, Lightbox2, Magnific Popup, SweetAlert, Toastr, parallax100,
  daterangepicker, isotope, perfect-scrollbar, noUiSlider.
- Four icon fonts, replaced by inline SVG.
- All `.scss.liquid` and `.css.liquid` files — Shopify no longer supports Sass in themes.
- All four external CDN dependencies.
- The hard-coded multi-currency switcher, superseded by Shopify Markets.
- The Google+ social setting and the reference to the retired Product Reviews app.

### Verified
- `shopify theme check`: 0 offenses. The v1 master branch of `ColorlibHQ/Fashe` scores
  48 errors and 21 warnings on the same tool, including 5 Liquid syntax errors and 3
  missing assets.
- Every `render`/`section`/`sections` reference, every template and preset block type,
  and all 213 `| t` translation keys resolve.

### Not yet verified
- The theme has not been rendered against a live store in this build. Run
  `shopify theme dev` against a development store and check the product, collection,
  cart and search templates with real data.
