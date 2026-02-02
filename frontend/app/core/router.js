import { HomePage } from '../pages/home/index.js?v=remon19';
import { ProductsPage } from '../pages/products/list.js?v=remon19';
import { ProductDetailPage } from '../pages/products/detail.js?v=remon19';
import { CartPage } from '../pages/cart/index.js?v=remon19';
import { CheckoutPage } from '../pages/checkout/index.js?v=remon19';
import { OrdersPage } from '../pages/orders/list.js?v=remon19';
import { OrderDetailPage } from '../pages/orders/detail.js?v=remon19';
import { AddProductPage } from '../pages/products/add.js?v=remon19';
import { AdminOrdersPage } from '../pages/admin/orders.js?v=remon19';
import { MyProductsPage } from '../pages/admin/my-products.js?v=remon19';

// Auth Pages
import { LoginPage } from '../pages/auth/login.js';
import { RegisterPage } from '../pages/auth/register.js';
import { VerifyAccountPage } from '../pages/auth/verify-account.js';
import { ForgotPasswordPage } from '../pages/auth/forgot-password.js';
import { VerifyResetPage } from '../pages/auth/verify-reset.js';
import { NewPasswordPage } from '../pages/auth/new-password.js';
import { ChangePasswordPage } from '../pages/auth/change-password.js';

import { State } from './state.js?v=remon16';

let outletEl = null;

const routes = [
  { pattern: '#/', render: HomePage },
  { pattern: '#/dashboard', render: ProductsPage },
  { pattern: '#/products', render: ProductsPage },
  { pattern: '#/product/:id', render: ProductDetailPage },
  { pattern: '#/cart', render: CartPage },
  { pattern: '#/checkout', render: CheckoutPage },
  { pattern: '#/orders', render: OrdersPage },
  { pattern: '#/orders/:id', render: OrderDetailPage },
  { pattern: '#/products/add', render: AddProductPage },
  { pattern: '#/admin/orders', render: AdminOrdersPage },
  { pattern: '#/admin/my-products', render: MyProductsPage },
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
  
  // Public Access: Allow Home/Dashboard without login
  if (hash === '#/' || hash === '') {
    navigate('#/dashboard');
    return;
  }

  // Protected Routes - Redirect to login if not authenticated
  // Allow Cart for guests, but protect Checkout
  const protectedRoutes = ['#/checkout', '#/orders', '#/admin'];
  const user = State.getUser();
  
  if (!user && protectedRoutes.some(route => hash.startsWith(route))) {
     navigate('#/login');
     return;
  }

  // Prevent accessing new-password if no OTP verified
  if (hash === '#/new-password') {
    const otp = State.getPendingOTP();
    const email = State.getPendingEmail();
    if (!otp || !email) {
       navigate('#/login');
       return;
    }
  }

  const match = matchRoute(hash);
  if (!match) {
    outletEl.innerHTML = `<section><h2>Halaman tidak ditemukan</h2><p>${hash}</p></section>`;
    return;
  }

  try {
    const html = match.render(match.params || {});
    outletEl.innerHTML = html;
    // Jalankan binder halaman jika tersedia
    if (window.__bindPage) {
      // Execute async binder but catch errors to prevent global rejection
      Promise.resolve(window.__bindPage()).catch(e => console.error('BindPage Error:', e));
      window.__bindPage = null;
    }
  } catch (err) {
    console.error(err);
    outletEl.innerHTML = `<div style="padding: 20px; color: red;">
      <h3>Terjadi Kesalahan Aplikasi</h3>
      <pre>${err.message}\n${err.stack}</pre>
    </div>`;
  }
}
