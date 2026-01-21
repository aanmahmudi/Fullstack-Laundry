import { navigate } from '../core/router.js?v=20260119';
import { State } from '../core/state.js?v=fix3';

export function renderHeader(el) {
  function render() {
    // Sembunyikan header jika di halaman auth
    const hash = window.location.hash;
    const isAuthPage = hash.includes('login') || hash.includes('register') || hash.includes('forgot-password') || hash.includes('verify') || hash.includes('reset-password') || hash.includes('verify-reset-otp') || hash.includes('new-password');
    
    if (isAuthPage) {
      el.style.display = 'none';
      return;
    } else {
      el.style.display = 'block';
    }

    const user = State.getUser();
    const count = State.getCart().reduce((s, x) => s + (Number(x.qty) || 1), 0);

    // HTML Structure
    el.innerHTML = `
      <div class="header-container">
        <!-- Logo -->
        <div class="header-left">
          <a class="brand" href="#/">
            <span style="font-size:24px">🧺</span> Laundry<span>App</span>
          </a>
        </div>

        <!-- Search Bar -->
        <div class="header-search">
          <form id="global-search" class="search-form">
            <input id="global-search-input" type="text" placeholder="Cari layanan atau produk..." aria-label="Cari produk" />
            <button type="submit">Cari</button>
          </form>
        </div>

        <!-- Actions -->
        <div class="header-actions">
          ${user ? `
            <a href="#/orders" class="nav-link">Pesanan</a>
          ` : ''}
          
          <a href="#/cart" class="icon-btn" title="Keranjang">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            ${count > 0 ? `<span class="badge">${count}</span>` : ''}
          </a>

          ${user ? `
            <div class="user-menu-container">
              <div class="user-menu-trigger">
                <div class="user-info">
                  <span class="user-name">${user.username || user.email.split('@')[0]}</span>
                  <span class="user-role">Customer</span>
                </div>
                <div class="avatar-placeholder">
                  ${(user.username || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div class="user-dropdown">
                 <div class="dropdown-header">
                    <strong>${user.username || user.email.split('@')[0]}</strong>
                 </div>
                 <a href="#/orders" class="dropdown-item">
                   <span class="icon">📦</span> Pesanan Saya
                 </a>
                 <a href="#/change-password" class="dropdown-item">
                   <span class="icon">🔒</span> Ganti Password
                 </a>
                 <div class="dropdown-divider"></div>
                 <a href="#" id="header-logout" class="dropdown-item danger">
                   <span class="icon">🚪</span> Logout
                 </a>
              </div>
            </div>
          ` : `
            <div style="display:flex; gap:12px">
              <a href="#/login" class="nav-link">Masuk</a>
              <a href="#/register" class="btn primary small">Daftar</a>
            </div>
          `}
        </div>
      </div>
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
