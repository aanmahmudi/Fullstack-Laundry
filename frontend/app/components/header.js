import { navigate } from '../core/router.js?v=20260119';
import { State } from '../core/state.js';

export function renderHeader(el) {
  function render() {
    // Sembunyikan header jika di halaman auth
    const hash = window.location.hash;
    const isAuthPage = hash.includes('login') || hash.includes('register') || hash.includes('forgot-password') || hash.includes('verify');
    
    if (isAuthPage) {
      el.style.display = 'none';
      return;
    } else {
      el.style.display = 'block';
    }

    const user = State.getUser();
    const count = State.getCart().reduce((s, x) => s + (Number(x.qty) || 1), 0);

    // Tentukan link navigasi auth berdasarkan status login
    let authLinks = '';
    if (user) {
      authLinks = `
        <a href="#/dashboard">Dashboard</a>
        <a href="#" id="header-logout">Logout</a>
      `;
    } else {
      authLinks = `
        <a href="#/login">Login</a>
        <a href="#/register">Register</a>
      `;
    }

    // Render HTML header
    el.innerHTML = `
      <nav class="nav">
        <div class="nav-left">
          <a class="brand" href="#/">Laundry</a>
          <a href="#/products">Produk</a>
          ${user ? '<a href="#/orders">Pesanan</a>' : ''}
        </div>
        <div class="nav-center">
          <form id="global-search" class="searchbar">
            <input id="global-search-input" type="text" placeholder="Cari produk..." aria-label="Cari produk" />
            <button class="btn primary" type="submit">Cari</button>
          </form>
        </div>
        <div class="nav-right">
          <a href="#/cart">Keranjang <span class="badge">${count}</span></a>
          ${authLinks}
        </div>
      </nav>
    `;

    // Bind event listeners
    el.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', async (ev) => {
        ev.preventDefault();
        const href = a.getAttribute('href');
        const id = a.id;

        if (id === 'header-logout') {
          // Handle Logout
          try {
            if (user?.email && typeof API !== 'undefined') {
              await API.apiPost('/api/customers/logout', { email: user.email });
            }
          } catch (_) { /* ignore error */ }
          State.clearUser();
          navigate('#/login');
        } else {
          // Handle Navigation
          navigate(href);
        }
      });
    });

    // Search bar listener
    const form = el.querySelector('#global-search');
    const input = el.querySelector('#global-search-input');
    if (form && input) {
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const q = String(input.value || '').trim();
        if (!location.hash.startsWith('#/products')) navigate('#/products');
        window.dispatchEvent(new CustomEvent('global:search', { detail: { q } }));
      });
    }
  }

  // Initial render
  render();

  // Listen for hash changes to toggle visibility
  window.addEventListener('hashchange', render);

  // Listen for user updates (login/logout) to re-render header
  window.addEventListener('user:updated', () => render());

  // Listen for cart updates to update badge
  window.addEventListener('cart:updated', (e) => {
    const badge = el.querySelector('.badge');
    if (badge) badge.textContent = e.detail.count;
  });
}
