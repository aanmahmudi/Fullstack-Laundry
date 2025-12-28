import { HomePage } from '../pages/home.js';
import { ProductsPage } from '../pages/products.js';
import { ProductDetailPage } from '../pages/product-detail.js';
import { CartPage } from '../pages/cart.js';
import { CheckoutPage } from '../pages/checkout.js';
import { OrdersPage } from '../pages/orders.js';
import { OrderDetailPage } from '../pages/order-detail.js';
// Cache-busting import untuk memastikan perubahan AuthPage terbaca di browser
import { AuthPage } from '../pages/auth.js?v=20251228';

let outletEl = null;

const routes = [
  { pattern: '#/', render: HomePage },
  { pattern: '#/products', render: ProductsPage },
  { pattern: '#/product/:id', render: ProductDetailPage },
  { pattern: '#/cart', render: CartPage },
  { pattern: '#/checkout', render: CheckoutPage },
  { pattern: '#/orders', render: OrdersPage },
  { pattern: '#/orders/:id', render: OrderDetailPage },
  { pattern: '#/auth', render: AuthPage },
];

function matchRoute(hash) {
  for (const r of routes) {
    const parts = r.pattern.split('/');
    const hparts = hash.split('/');
    if (parts.length !== hparts.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith(':')) {
        params[parts[i].slice(1)] = hparts[i];
      } else if (parts[i] !== hparts[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return { ...r, params };
  }
  return null;
}

export function navigate(hash) {
  if (location.hash !== hash) location.hash = hash;
  render();
}

export function initRouter({ outlet }) {
  outletEl = outlet;
  window.addEventListener('hashchange', render);
  render();
}

function render() {
  const hash = location.hash || '#/';
  const match = matchRoute(hash);
  if (!match) {
    outletEl.innerHTML = `<section><h2>Halaman tidak ditemukan</h2><p>${hash}</p></section>`;
    return;
  }
  const html = match.render(match.params || {});
  outletEl.innerHTML = html;
  // Jalankan binder halaman jika tersedia
  if (window.__bindPage) {
    try { window.__bindPage(); } catch { /* noop */ }
    window.__bindPage = null;
  }
}