import { ProductsPage } from '../pages/products/list.js?v=remon118';
import { ProductDetailPage } from '../pages/products/detail.js?v=remon120';
import { CartPage } from '../pages/cart/index.js?v=remon118';
import { CheckoutPage } from '../pages/checkout/index.js?v=remon116';
import { OrdersPage } from '../pages/orders/list.js?v=remon116';
import { OrderDetailPage } from '../pages/orders/detail.js?v=remon116';
import { AddProductPage } from '../pages/products/add.js?v=remon116';
import { AdminOrdersPage } from '../pages/admin/orders.js?v=remon116';
import { MyProductsPage } from '../pages/admin/my-products.js?v=remon118';
import { ShopListPage } from '../pages/admin/shops/list.js?v=remon116';
import { ShopAddPage } from '../pages/admin/shops/add.js?v=remon116';
import { ShopDetailPage } from '../pages/admin/shops/detail.js?v=remon120';
import { PublicShopDetailPage } from '../pages/shops/detail.js';

// Auth Pages
import { LoginPage } from '../pages/auth/login.js';
import { RegisterPage } from '../pages/auth/register.js';
import { VerifyAccountPage } from '../pages/auth/verify-account.js';
import { ForgotPasswordPage } from '../pages/auth/forgot-password.js';
import { VerifyResetPage } from '../pages/auth/verify-reset.js';
import { NewPasswordPage } from '../pages/auth/new-password.js';
import { ChangePasswordPage } from '../pages/auth/change-password.js';

import { State } from './state.js?v=remon118';

let outletEl = null;

const routes = [
  { pattern: '/', render: ProductsPage },
  { pattern: '/dashboard', render: ProductsPage },
  { pattern: '/products', render: ProductsPage },
  { pattern: '/product/:id', render: ProductDetailPage },
  { pattern: '/cart', render: CartPage },
  { pattern: '/checkout', render: CheckoutPage },
  { pattern: '/orders', render: OrdersPage },
  { pattern: '/orders/:id', render: OrderDetailPage },
  { pattern: '/products/add', render: AddProductPage },
  { pattern: '/admin/orders', render: AdminOrdersPage },
  { pattern: '/admin/my-products', render: MyProductsPage },
  { pattern: '/admin/shops', render: ShopListPage },
  { pattern: '/admin/shops/add', render: ShopAddPage },
  { pattern: '/admin/shops/:id', render: ShopDetailPage },
  { pattern: '/shops/:id', render: PublicShopDetailPage },
  { pattern: '/auth', render: LoginPage }, // Deprecated, use /login
  { pattern: '/login', render: LoginPage },
  { pattern: '/register', render: RegisterPage },
  { pattern: '/forgot-password', render: ForgotPasswordPage },
  { pattern: '/verify-reset-otp', render: VerifyResetPage },
  { pattern: '/new-password', render: NewPasswordPage },
  { pattern: '/change-password', render: ChangePasswordPage },
  { pattern: '/verify', render: VerifyAccountPage },
];

function migrateLegacyHashRouting() {
  const hash = window.location.hash || '';
  if (hash.startsWith('#/')) {
    const newPath = hash.slice(1);
    window.history.replaceState({}, '', newPath);
  }
}

function normalizePath(path) {
  if (!path) return '/';
  const u = new URL(path, window.location.origin);
  let pathname = u.pathname || '/';
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  return pathname + (u.search || '');
}

function matchRoute(pathname) {
  for (const r of routes) {
    const [patternPath] = r.pattern.split('?');
    const parts = patternPath.split('/');
    const hparts = pathname.split('/');
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

export function navigate(path) {
  const normalized = normalizePath(path);
  const [pathname, search = ''] = normalized.split('?');
  const target = pathname + (search ? `?${search}` : '');
  if (window.location.pathname + window.location.search !== target) {
    window.history.pushState({}, '', target);
  }
  render();
}

export function initRouter({ outlet }) {
  outletEl = outlet || document.getElementById('app-main');
  if (!outletEl) {
    console.error('Router init failed: outlet element not found');
    return;
  }
  migrateLegacyHashRouting();
  window.addEventListener('popstate', render);
  render();
}

function render() {
  if (!outletEl) {
    outletEl = document.getElementById('app-main');
  }
  if (!outletEl) {
    console.error('Router outlet element not available');
    return;
  }
  const fullPath = normalizePath(window.location.pathname + window.location.search);
  const [pathname, queryString = ''] = fullPath.split('?');

  const queryParams = {};
  if (queryString) {
    queryString.split('&').forEach((param) => {
      if (!param) return;
      const [key, val] = param.split('=');
      if (key) queryParams[key] = decodeURIComponent(val || '');
    });
  }

  const protectedRoutes = ['/checkout', '/orders', '/admin'];
  const user = State.getUser();

  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    navigate('/login');
    return;
  }

  if (pathname === '/cart') {
    const html = CartPage({});
    outletEl.innerHTML = html;
    window.scrollTo(0, 0);
    if (window.__bindPage) {
      Promise.resolve(window.__bindPage()).catch((e) => console.error('BindPage Error:', e));
      window.__bindPage = null;
    }
    return;
  }

  if (pathname === '/login') {
    const html = LoginPage({});
    outletEl.innerHTML = html;
    window.scrollTo(0, 0);
    return;
  }

  if (pathname === '/register') {
    const html = RegisterPage({});
    outletEl.innerHTML = html;
    window.scrollTo(0, 0);
    return;
  }

  if (pathname === '/forgot-password') {
    const html = ForgotPasswordPage({});
    outletEl.innerHTML = html;
    window.scrollTo(0, 0);
    return;
  }

  if (pathname === '/new-password') {
    const otp = State.getPendingOTP();
    const email = State.getPendingEmail();
    if (!otp || !email) {
      navigate('/login');
      return;
    }
  }

  const match = matchRoute(pathname);
  if (!match) {
    if (pathname === '/') {
      navigate('/dashboard');
      return;
    }
    if (pathname === '/dashboard') {
      const html = routes[0].render({});
      outletEl.innerHTML = html;
      if (window.__bindPage) {
        Promise.resolve(window.__bindPage()).catch((e) => console.error('BindPage Error:', e));
        window.__bindPage = null;
      }
      return;
    }
    outletEl.innerHTML = `<section><h2>Halaman tidak ditemukan</h2><p>${fullPath}</p></section>`;
    return;
  }

  try {
    const finalParams = { ...match.params, ...queryParams };
    const html = match.render(finalParams);
    outletEl.innerHTML = html;

    window.scrollTo(0, 0);

    if (window.__bindPage) {
      Promise.resolve(window.__bindPage()).catch((e) => console.error('BindPage Error:', e));
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
