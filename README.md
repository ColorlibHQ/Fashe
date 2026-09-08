# Fashe 2.0 — Shopify theme

A free fashion and apparel theme for Shopify, rebuilt from scratch on the current
theme architecture. No jQuery, no CSS framework, no third-party assets.

## What it is

Fashe 2.0 is a **theme-blocks theme** — the newest Shopify theme architecture, the
same generation as Shopify's Horizon themes. Merchants can add, remove, reorder and
nest blocks inside sections directly in the theme editor, including on the product
page.

| | Fashe 1.x (2018) | Fashe 2.0 |
|---|---|---|
| `shopify theme check` | 48 errors, 21 warnings | **0** |
| Architecture | Vintage (pre Online Store 2.0) | Theme blocks + JSON templates + section groups |
| Stylesheets on the homepage | 19 | 1 |
| Scripts on the homepage | 34 | 1 (ES module) |
| jQuery | 3.2.1 | none |
| CSS framework | Bootstrap 4 | none — ~1,600 lines of plain CSS |
| Carousels | Slick + Owl + bxSlider | CSS scroll-snap |
| Lightbox / popups | Lightbox2, Magnific Popup, SweetAlert, Toastr | native `<dialog>` |
| Icons | 4 icon fonts (Font Awesome, Themify, Linearicons, Elegant) | inline SVG |
| Sass | 13 `.scss.liquid` / `.css.liquid` files | none (Shopify no longer supports Sass) |
| External CDNs | 4 (bootstrapcdn, jsdelivr, cdnjs ×2) | none |
| Currency switching | Hard-coded currency list | Shopify Markets |
| Filtering | none | Search & Discovery filters |
| `{% include %}` (deprecated) | 148 uses | 0 — `{% render %}` throughout |
| Cart | Page reload | Ajax cart drawer via the Section Rendering API |
| Colour schemes | 14 individual colour settings | 4 editable colour schemes, per section |

## Installing

Upload `fashe-shopify-theme.zip` in **Online Store → Themes → Add theme → Upload zip**.

To work on it locally:

```bash
npm install -g @shopify/cli
shopify theme dev --store your-store.myshopify.com   # live preview
shopify theme check                                  # lint (currently: 0 offenses)
shopify theme push                                   # upload
```

## Structure

```
assets/          base.css (design system), theme.js (custom elements)
blocks/          14 theme blocks — reusable and nestable across sections
config/          settings_schema.json, settings_data.json (4 colour schemes, 2 presets)
layout/          theme.liquid, password.liquid
locales/         en.default.json — every storefront string
sections/        36 sections + 2 section groups (header, footer)
snippets/        18 shared partials (product card, price, cart, facets, schema…)
templates/       19 JSON templates + gift_card.liquid
```

### Theme blocks

`blocks/` holds blocks merchants can place in any section that accepts `@theme`:

`title` `vendor` `price` `variant-picker` `quantity` `buy-buttons` `inventory`
`description` `accordion` `heading` `text` `button` `image` `group`

`group` accepts child blocks, so layouts can be nested without code.

### JavaScript

One ES module, ~650 lines, all behaviour as custom elements that no-op when their
element is absent:

`quantity-input` `product-form` `cart-drawer` `cart-page` `variant-picker`
`product-gallery` `predictive-search` `announcement-rotator` `address-form`

Filtering, cart updates and search results use the Section Rendering API, so Liquid
stays the single source of truth for markup.

### Performance notes

- One stylesheet, one module script, zero external requests.
- All images use `image_tag` with `srcset`, `sizes`, explicit dimensions and lazy
  loading; the hero and first product image are `eager` + `fetchpriority="high"`.
- Carousels and the product gallery are CSS scroll-snap — no carousel library.
- Drawers are native `<dialog>`, so focus trapping, `Esc` and inert backgrounds are
  free.
- Motion is disabled under `prefers-reduced-motion`.

### Accessibility

Skip link, visible focus rings, labelled form inputs, `aria-current` navigation,
`role="listbox"` search suggestions, 24px+ touch targets, and alt text driven by
`image.alt` throughout.

## Open issues this rewrite addresses

Measured against the 20 open issues on `ColorlibHQ/Fashe`. These are addressed by the
rewrite's design; none are verified against a live store yet (see Known gaps).

| Issue | Addressed by |
|---|---|
| #62 Limiting blog posts on home page | `blog-posts` section has a `posts_to_show` setting |
| #60 Cart on mobile not clickable | Header cart rebuilt; opens the cart drawer |
| #57 Cart/checkout button will not work | Standard `{% form 'cart' %}` with a `checkout` submit |
| #56 Cart will not display the item added | Ajax add-to-cart re-renders the drawer via the Section Rendering API |
| #49 Cart shows the item twice | One `cart-items` snippet shared by drawer and cart page |
| #47 Add to cart on mobile shows cart empty | Same ajax cart path on every breakpoint |
| #46 Update Cart redirects to checkout | Separate `update` submit, distinct from `checkout` |
| #54 #55 #58 #59 Colour palettes not fully applied | Colour schemes applied per section, 404 and footer included |
| #53 Instagram access token / 404 | Instagram feed section dropped — the Basic Display API was shut down in Dec 2024 |
| #50 Currency converter not working | Replaced by the native Shopify Markets country/currency selector |
| #48 No documentation | This README plus CHANGELOG |
| #42 `{% include %}` deprecated in favour of `{% render %}` | v1 had 148 `include` calls; v2 has none |

## Known gaps

- Section and block **schema labels are plain English**. Storefront strings are all
  translated through `locales/en.default.json`; translating the editor labels needs a
  `locales/en.default.schema.json` and `t:` keys. Required before a Theme Store
  submission, not required to run the theme.
- Only `en.default.json` ships. Add more locale files for other languages.
- Not yet rendered against a live store — see CHANGELOG.

## Licence

**Undecided.** `ColorlibHQ/Fashe` has never carried a `LICENSE` file, and the repo has
63 forks and merged community pull requests. Pick and add one before release rather than
inheriting the ambiguity.
