import { HomePage } from '../pages/home/index.js';
import { ProductsPage } from '../pages/products/list.js';
import { ProductDetailPage } from '../pages/products/detail.js';
import { CartPage } from '../pages/cart/index.js';
import { CheckoutPage } from '../pages/checkout/index.js';
import { OrdersPage } from '../pages/orders/list.js';
import { OrderDetailPage } from '../pages/orders/detail.js';

// Auth Pages
import { LoginPage } from '../pages/auth/login.js';
import { RegisterPage } from '../pages/auth/register.js';
import { VerifyAccountPage } from '../pages/auth/verify-account.js';
import { ForgotPasswordPage } from '../pages/auth/forgot-password.js';
import { VerifyResetPage } from '../pages/auth/verify-reset.js';
import { NewPasswordPage } from '../pages/auth/new-password.js';
import { ChangePasswordPage } from '../pages/auth/change-password.js';

import { State } from './state.js?v=fix8';

let outletEl = null;

const routes = [
  { pattern: '#/', render: HomePage },
  { pattern: '#/dashboard', render: HomePage },
  { pattern: '#/products', render: ProductsPage },
  { pattern: '#/product/:id', render: ProductDetailPage },
  { pattern: '#/cart', render: CartPage },
  { pattern: '#/checkout', render: CheckoutPage },
  { pattern: '#/orders', render: OrdersPage },
  { pattern: '#/orders/:id', render: OrderDetailPage },
  { pattern: '#/auth', render: LoginPage }, // Deprecated, use /login
  { pattern: '#/login', render: LoginPage },
  { pattern: '#/register', render: RegisterPage },
  { pattern: '#/forgot-password', render: ForgotPasswordPage },
  { pattern: '#/verify-reset-otp', render: VerifyResetPage },
  { pattern: '#/new-password', render: NewPasswordPage },
  { pattern: '#/change-password', render: ChangePasswordPage },
  { pattern: '#/verify', render: VerifyAccountPage },
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
  let hash = location.hash || '#/';
  
  // Root redirect logic
  if (hash === '#/' || hash === '') {
    const user = State.getUser();
    if (user) {
      navigate('#/dashboard');
      return;
    } else {
      navigate('#/login');
      return;
    }
  }

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
