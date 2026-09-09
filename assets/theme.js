/* Fashe theme scripts — vanilla ES modules, custom elements, no dependencies. */

const routes = window.Fashe?.routes ?? {};
const strings = window.Fashe?.strings ?? {};

/* Utilities ------------------------------------------------------------- */

const parseHTML = (html) => new DOMParser().parseFromString(html, 'text/html');

const sectionInnerHTML = (html, selector) => parseHTML(html).querySelector(selector)?.innerHTML;

const fetchConfig = (body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify(body),
});

const publish = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));

/* Dialog helpers -------------------------------------------------------- */

const openDialog = (id) => {
  const dialog = document.getElementById(id);
  if (!dialog || dialog.open) return;
  dialog.showModal();
};

document.addEventListener('click', (event) => {
  const opener = event.target.closest('[data-drawer-open]');
  if (opener) {
    const id = opener.getAttribute('data-drawer-open');
    if (document.getElementById(id)) {
      event.preventDefault();
      openDialog(id);
    }
    return;
  }

  const closer = event.target.closest('[data-drawer-close]');
  if (closer) {
    event.preventDefault();
    closer.closest('dialog')?.close();
    return;
  }

  const confirmer = event.target.closest('[data-confirm-message]');
  if (confirmer && !window.confirm(confirmer.getAttribute('data-confirm-message'))) {
    event.preventDefault();
  }
});

// Click on the backdrop closes the dialog.
document.addEventListener('click', (event) => {
  if (event.target.tagName !== 'DIALOG' || !event.target.open) return;
  const box = event.target.getBoundingClientRect();
  const inside =
    event.clientX >= box.left &&
    event.clientX <= box.right &&
    event.clientY >= box.top &&
    event.clientY <= box.bottom;
  if (!inside) event.target.close();
});

/* Quantity input -------------------------------------------------------- */

class QuantityInput extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input');
    if (!this.input) return;
    this.addEventListener('click', this.onClick);
    this.input.addEventListener('change', () => this.dispatchEvent(new Event('quantity:change', { bubbles: true })));
  }

  onClick = (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    event.preventDefault();
    const step = button.name === 'plus' ? 1 : -1;
    const min = Number(this.input.min || 0);
    const next = Number(this.input.value) + step;
    this.input.value = String(Math.max(min, next));
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  };
}
customElements.define('quantity-input', QuantityInput);

/* Cart ------------------------------------------------------------------ */

const CART_SECTIONS = ['cart-drawer', 'cart-icon-bubble'];

async function updateCartSections(sections) {
  if (!sections) return;

  if (sections['cart-icon-bubble']) {
    const bubble = sectionInnerHTML(sections['cart-icon-bubble'], '.header__cart-icon');
    const target = document.querySelector('#CartIconBubble .header__cart-icon');
    if (bubble != null && target) target.innerHTML = bubble;
  }

  if (sections['cart-drawer']) {
    const inner = sectionInnerHTML(sections['cart-drawer'], '.drawer__inner');
    const target = document.querySelector('#CartDrawer .drawer__inner');
    if (inner != null && target) target.innerHTML = inner;
  }
}

async function changeCartLine({ line, quantity }, contextEl) {
  contextEl?.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(routes.cartChange, fetchConfig({ line, quantity, sections: CART_SECTIONS.join(',') }));
    const data = await response.json();
    await updateCartSections(data.sections);

    // The cart page is rendered by Liquid, so reload its markup from the cart URL.
    const cartPage = document.querySelector('cart-page');
    if (cartPage) {
      const html = await (await fetch(routes.cart)).text();
      const fresh = parseHTML(html).querySelector('cart-page');
      if (fresh) {
        cartPage.innerHTML = fresh.innerHTML;
      } else {
        window.location.reload();
      }
    }

    publish('cart:updated', data);
  } finally {
    contextEl?.removeAttribute('aria-busy');
  }
}

class CartDrawer extends HTMLElement {
  connectedCallback() {
    this.addEventListener('change', this.onChange);
    this.addEventListener('click', this.onClick);
  }

  onChange = (event) => {
    const input = event.target.closest('.quantity__input');
    if (!input) return;
    changeCartLine({ line: input.dataset.index, quantity: input.value }, this);
  };

  onClick = (event) => {
    const remove = event.target.closest('[data-remove-line]');
    if (!remove) return;
    event.preventDefault();
    changeCartLine({ line: remove.getAttribute('data-remove-line'), quantity: 0 }, this);
  };
}
customElements.define('cart-drawer', CartDrawer);

class CartPage extends HTMLElement {
  connectedCallback() {
    this.addEventListener('change', this.onChange);
    this.addEventListener('click', this.onClick);
  }

  onChange = (event) => {
    const input = event.target.closest('.quantity__input');
    if (!input) return;
    changeCartLine({ line: input.dataset.index, quantity: input.value }, this);
  };

  onClick = (event) => {
    const remove = event.target.closest('[data-remove-line]');
    if (!remove) return;
    event.preventDefault();
    changeCartLine({ line: remove.getAttribute('data-remove-line'), quantity: 0 }, this);
  };
}
customElements.define('cart-page', CartPage);

/* Add to cart ----------------------------------------------------------- */

class ProductForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    if (!this.form) return;
    this.submitButton = this.querySelector('[type="submit"]');
    this.errorTarget = this.querySelector('[data-form-error]');
    this.form.addEventListener('submit', this.onSubmit);
  }

  onSubmit = async (event) => {
    if (window.Fashe?.cartType !== 'drawer') return;
    event.preventDefault();
    if (this.submitButton?.getAttribute('aria-disabled') === 'true') return;

    this.setLoading(true);
    this.hideError();

    const formData = new FormData(this.form);
    formData.append('sections', CART_SECTIONS.join(','));

    try {
      const response = await fetch(routes.cartAdd, {
        method: 'POST',
        headers: { Accept: 'application/javascript' },
        body: formData,
      });
      const data = await response.json();

      if (data.status) {
        this.showError(data.description || data.message);
        return;
      }

      await updateCartSections(data.sections);
      publish('cart:updated', data);
      openDialog('CartDrawer');
    } catch (error) {
      this.showError(strings.error);
    } finally {
      this.setLoading(false);
    }
  };

  setLoading(loading) {
    if (!this.submitButton) return;
    this.submitButton.setAttribute('aria-disabled', loading ? 'true' : 'false');
    this.submitButton.classList.toggle('is-loading', loading);
  }

  showError(message) {
    if (!this.errorTarget || !message) return;
    this.errorTarget.textContent = message;
    this.errorTarget.hidden = false;
  }

  hideError() {
    if (!this.errorTarget) return;
    this.errorTarget.hidden = true;
  }
}
customElements.define('product-form', ProductForm);

/* Variant picker -------------------------------------------------------- */

class VariantPicker extends HTMLElement {
  connectedCallback() {
    const data = this.querySelector('[data-variant-data]');
    if (!data) return;

    try {
      this.variants = JSON.parse(data.textContent);
    } catch {
      return;
    }

    this.addEventListener('change', this.onChange);
  }

  get selectedOptions() {
    return Array.from(this.querySelectorAll('input[data-option-position]:checked'))
      .sort((a, b) => Number(a.dataset.optionPosition) - Number(b.dataset.optionPosition))
      .map((input) => input.value);
  }

  onChange = () => {
    const selected = this.selectedOptions;
    const variant = this.variants.find((candidate) =>
      candidate.options.every((option, index) => option === selected[index])
    );

    this.updateOptionLabels();
    this.updateVariantInput(variant);
    this.updatePrice(variant);
    this.updateInventory(variant);
    this.updateURL(variant);
    this.updateGallery(variant);
  };

  updateOptionLabels() {
    this.querySelectorAll('input[data-option-position]:checked').forEach((input) => {
      const label = this.querySelector(`[data-option-value="${input.dataset.optionPosition}"]`);
      if (label) label.textContent = input.value;
    });
  }

  updateVariantInput(variant) {
    const input = document.querySelector('[data-variant-id]');
    const button = document.querySelector('[data-add-button]');
    const buttonText = document.querySelector('[data-add-button-text]');

    if (input) {
      input.value = variant?.id ?? '';
      input.disabled = !variant?.available;
    }

    if (button) button.disabled = !variant?.available;
    if (buttonText) {
      buttonText.textContent = !variant ? strings.unavailable : variant.available ? strings.addToCart : strings.soldOut;
    }
  }

  updatePrice(variant) {
    const target = document.querySelector('[data-product-price] .price');
    if (!target || !variant) return;

    const parts = [`<span class="${variant.on_sale ? 'price__sale' : ''}">${variant.price}</span>`];
    if (variant.on_sale && variant.compare_at_price) {
      parts.push(`<s class="price__compare">${variant.compare_at_price}</s>`);
    }
    target.innerHTML = parts.join('');
    target.classList.toggle('price--on-sale', Boolean(variant.on_sale));
  }

  updateInventory(variant) {
    const wrapper = document.querySelector('[data-inventory]');
    const text = wrapper?.querySelector('[data-inventory-text]');
    if (!wrapper || !text || !variant) return;

    const threshold = Number(wrapper.dataset.threshold || 0);
    text.classList.remove('inventory--low', 'inventory--out');

    if (!variant.available) {
      text.classList.add('inventory--out');
      text.textContent = wrapper.dataset.textOutOfStock;
    } else if (variant.inventory_management && variant.inventory_quantity > 0 && variant.inventory_quantity <= threshold) {
      text.classList.add('inventory--low');
      text.textContent = (wrapper.dataset.textLow || '').replace('[count]', variant.inventory_quantity);
    } else {
      text.textContent = wrapper.dataset.textInStock;
    }
  }

  updateURL(variant) {
    if (!variant || !this.dataset.url) return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${variant.id}`);
  }

  updateGallery(variant) {
    if (!variant?.featured_media_id) return;
    const media = document.querySelector(`[data-media-id="${variant.featured_media_id}"]`);
    const scroller = document.querySelector('.product__media-scroller');
    if (!media || !scroller) return;
    scroller.scrollTo({ left: media.offsetLeft - scroller.offsetLeft, behavior: 'smooth' });
  }
}
customElements.define('variant-picker', VariantPicker);

/* Product gallery ------------------------------------------------------- */

class ProductGallery extends HTMLElement {
  connectedCallback() {
    this.scroller = this.querySelector('.product__media-scroller');
    this.dots = Array.from(this.querySelectorAll('.slideshow__dot'));
    if (!this.scroller || this.dots.length === 0) return;

    this.slides = Array.from(this.scroller.children);

    this.dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const slide = this.slides[Number(dot.dataset.index)];
        if (slide) this.scroller.scrollTo({ left: slide.offsetLeft - this.scroller.offsetLeft, behavior: 'smooth' });
      });
    });

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = this.slides.indexOf(entry.target);
          this.dots.forEach((dot, dotIndex) => dot.setAttribute('aria-selected', String(dotIndex === index)));
        });
      },
      { root: this.scroller, threshold: 0.6 }
    );

    this.slides.forEach((slide) => this.observer.observe(slide));
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }
}
customElements.define('product-gallery', ProductGallery);

/* Product recommendations ----------------------------------------------- */

class ProductRecommendations extends HTMLElement {
  connectedCallback() {
    if (!this.dataset.url) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        this.load();
      },
      { rootMargin: '0px 0px 400px 0px' }
    );

    observer.observe(this);
  }

  async load() {
    try {
      const html = await (await fetch(this.dataset.url)).text();
      const fresh = parseHTML(html).querySelector('product-recommendations');
      if (!fresh || fresh.innerHTML.trim() === '') return;
      this.innerHTML = fresh.innerHTML;
      publish('section:loaded', { target: this });
    } catch {
      // Recommendations are an enhancement; failing quietly is correct here.
    }
  }
}
customElements.define('product-recommendations', ProductRecommendations);

/* Predictive search ----------------------------------------------------- */

class PredictiveSearch extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input[type="search"]');
    this.results = this.querySelector('.predictive-search');
    if (!this.input || !this.results || this.dataset.enabled !== 'true') return;

    this.showPrice = this.dataset.showPrice === 'true';
    this.controller = null;
    this.input.addEventListener('input', this.onInput);
    this.input.addEventListener('keydown', this.onKeydown);
    document.addEventListener('click', this.onDocumentClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.onDocumentClick);
  }

  onDocumentClick = (event) => {
    if (!this.contains(event.target)) this.close();
  };

  onKeydown = (event) => {
    if (event.key === 'Escape') this.close();
  };

  onInput = () => {
    clearTimeout(this.timer);
    const term = this.input.value.trim();

    if (term.length < 2) {
      this.close();
      return;
    }

    this.timer = setTimeout(() => this.search(term), 250);
  };

  async search(term) {
    this.controller?.abort();
    this.controller = new AbortController();

    const params = new URLSearchParams({
      q: term,
      'resources[type]': 'product,collection,article,page',
      'resources[limit]': '6',
      'resources[options][unavailable_products]': 'last',
    });

    try {
      const response = await fetch(`${routes.predictiveSearch}?${params}&section_id=predictive-search`, {
        signal: this.controller.signal,
      });

      if (!response.ok) {
        // The JSON endpoint is the fallback when no predictive-search section exists.
        return this.searchJSON(term);
      }

      const html = await response.text();
      const markup = sectionInnerHTML(html, '#PredictiveSearchResults');
      if (markup == null) return this.searchJSON(term);

      this.results.innerHTML = markup;
      this.open();
    } catch (error) {
      if (error.name !== 'AbortError') this.close();
    }
  }

  async searchJSON(term) {
    const params = new URLSearchParams({
      q: term,
      'resources[type]': 'product',
      'resources[limit]': '6',
    });

    const response = await fetch(`${routes.predictiveSearch}?${params}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    const products = data?.resources?.results?.products ?? [];

    if (products.length === 0) {
      this.close();
      return;
    }

    const items = products
      .map((product) => {
        const image = product.featured_image?.url
          ? `<img src="${product.featured_image.url}" alt="" width="48" height="60" loading="lazy">`
          : '';
        const price = this.showPrice && product.price ? `<span class="text-xs">${product.price}</span>` : '';
        return `<li><a class="predictive-search__item" href="${product.url}">${image}<span>${product.title}</span>${price}</a></li>`;
      })
      .join('');

    this.results.innerHTML = `<div class="predictive-search__group"><ul class="predictive-search__list" role="list">${items}</ul></div>`;
    this.open();
  }

  open() {
    this.results.hidden = false;
    this.input.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.results.hidden = true;
    this.input.setAttribute('aria-expanded', 'false');
  }
}
customElements.define('predictive-search', PredictiveSearch);

/* Announcement rotator -------------------------------------------------- */

class AnnouncementRotator extends HTMLElement {
  connectedCallback() {
    this.items = Array.from(this.children);
    if (this.items.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.index = 0;
    const interval = (Number(this.dataset.interval) || 5) * 1000;
    this.timer = setInterval(() => this.next(), interval);
  }

  disconnectedCallback() {
    clearInterval(this.timer);
  }

  next() {
    this.items[this.index].hidden = true;
    this.index = (this.index + 1) % this.items.length;
    this.items[this.index].hidden = false;
  }
}
customElements.define('announcement-rotator', AnnouncementRotator);

/* Address form ---------------------------------------------------------- */

class AddressForm extends HTMLElement {
  connectedCallback() {
    this.countrySelect = this.querySelector('[data-country-select]');
    this.provinceSelect = this.querySelector('[data-province-select]');
    this.provinceWrapper = this.querySelector('[data-province-wrapper]');
    if (!this.countrySelect || !this.provinceSelect) return;

    if (this.countrySelect.dataset.default) {
      this.countrySelect.value = this.countrySelect.dataset.default;
    }

    this.countrySelect.addEventListener('change', () => this.updateProvinces());
    this.updateProvinces();
  }

  updateProvinces() {
    const option = this.countrySelect.selectedOptions[0];
    let provinces = [];

    try {
      provinces = JSON.parse(option?.dataset.provinces ?? '[]');
    } catch {
      provinces = [];
    }

    if (provinces.length === 0) {
      this.provinceWrapper.hidden = true;
      this.provinceSelect.innerHTML = '';
      return;
    }

    this.provinceSelect.innerHTML = provinces
      .map(([value, label]) => `<option value="${value}">${label}</option>`)
      .join('');

    if (this.provinceSelect.dataset.default) {
      this.provinceSelect.value = this.provinceSelect.dataset.default;
    }

    this.provinceWrapper.hidden = false;
  }
}
customElements.define('address-form', AddressForm);

/* Facets ---------------------------------------------------------------- */

const facetForm = document.getElementById('FacetFiltersForm');
if (facetForm) {
  let facetController = null;

  const applyFacets = async () => {
    const params = new URLSearchParams(new FormData(facetForm));
    // Drop empty values so the URL stays readable.
    Array.from(params.entries()).forEach(([key, value]) => {
      if (value === '') params.delete(key);
    });

    const url = `${window.location.pathname}?${params}`;
    facetController?.abort();
    facetController = new AbortController();

    const grid = document.getElementById('ProductGrid');
    grid?.setAttribute('aria-busy', 'true');

    try {
      const html = await (await fetch(url, { signal: facetController.signal })).text();
      const doc = parseHTML(html);

      const newGrid = doc.getElementById('ProductGrid');
      if (newGrid && grid) grid.innerHTML = newGrid.innerHTML;

      const newFacets = doc.getElementById('FacetsWrapper');
      const facets = document.getElementById('FacetsWrapper');
      if (newFacets && facets) {
        const openSummaries = Array.from(facets.querySelectorAll('details[open]')).map((d) =>
          d.querySelector('.facets__summary')?.textContent.trim()
        );
        facets.innerHTML = newFacets.innerHTML;
        facets.querySelectorAll('details').forEach((d) => {
          if (openSummaries.includes(d.querySelector('.facets__summary')?.textContent.trim())) d.open = true;
        });
      }

      window.history.pushState({}, '', url);
    } catch (error) {
      if (error.name !== 'AbortError') window.location.href = url;
    } finally {
      grid?.removeAttribute('aria-busy');
    }
  };

  facetForm.addEventListener('change', applyFacets);
  facetForm.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFacets();
  });
  window.addEventListener('popstate', () => window.location.reload());
}

/* Localization auto-submit ---------------------------------------------- */

document.querySelectorAll('select[data-auto-submit]').forEach((select) => {
  select.addEventListener('change', () => select.form?.submit());
});

/* Scroll reveal --------------------------------------------------------- */

if (document.body.classList.contains('animate-reveal') && 'IntersectionObserver' in window) {
  const reveal = (el) => {
    el.classList.add('is-visible');
    revealObserver.unobserve(el);
  };

  const revealObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && reveal(entry.target)),
    { rootMargin: '0px 0px -10% 0px' }
  );

  const observeAll = (root = document) =>
    root.querySelectorAll('[data-animate]:not(.is-visible)').forEach((el) => revealObserver.observe(el));

  // Safety net: IntersectionObserver drops entries during fast or programmatic
  // scrolling, which would otherwise leave whole sections invisible.
  let sweeping = false;
  const sweep = () => {
    sweeping = false;
    document.querySelectorAll('[data-animate]:not(.is-visible)').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) reveal(el);
    });
  };
  const scheduleSweep = () => {
    if (sweeping) return;
    sweeping = true;
    requestAnimationFrame(sweep);
  };

  observeAll();
  scheduleSweep();
  window.addEventListener('scroll', scheduleSweep, { passive: true });
  window.addEventListener('resize', scheduleSweep, { passive: true });
  document.addEventListener('shopify:section:load', (event) => observeAll(event.target));
  document.addEventListener('section:loaded', (event) => observeAll(event.detail.target));
}

/* Header height --------------------------------------------------------- */

const header = document.querySelector('.header-wrapper');
if (header) {
  const setHeaderHeight = () =>
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  setHeaderHeight();
  new ResizeObserver(setHeaderHeight).observe(header);
}
