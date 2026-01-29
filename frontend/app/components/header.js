import { navigate } from '../core/router.js';
import { State } from '../core/state.js';

export function renderHeader(el) {
  function render() {
    // Sembunyikan header full di halaman auth, tampilkan logo saja
    const hash = window.location.hash;
    const isAuthPage = hash.includes('login') || hash.includes('register') || hash.includes('forgot-password') || hash.includes('verify') || hash.includes('reset-password') || hash.includes('verify-reset-otp') || hash.includes('new-password');
    
    if (isAuthPage) {
      el.style.display = 'block';
      el.innerHTML = `
        <div class="header-container">
          <div class="header-left">
            <a class="brand" href="#/">
              <span style="color: var(--primary); font-weight: 800; font-size: 26px; letter-spacing: -0.5px;">Remon</span>
              <span style="font-weight: 600; font-size: 26px; color: var(--primary); margin-left: 4px;">Eccom</span>
            </a>
          </div>
        </div>
      `;
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
            <span style="color: var(--primary); font-weight: 800; font-size: 26px; letter-spacing: -0.5px;">Remon</span>
            <span style="font-weight: 600; font-size: 26px; color: var(--primary); margin-left: 4px;">Eccom</span>
          </a>
        </div>

        <!-- Search Bar -->
        <div class="header-search">
          <form id="global-search" class="search-form">
            <input id="global-search-input" type="text" placeholder="Cari produk di Remon Eccom..." aria-label="Cari produk" />
            <button type="submit" style="background: #f1f5f9; border: 1px solid #e2e8f0; border-left: none; border-radius: 0 99px 99px 0; width: 60px; display: flex; align-items: center; justify-content: center;">
                <span class="icon" style="color: #64748b;">🔍</span>
            </button>
          </form>
        </div>

        <!-- Actions -->
        <div class="header-actions">
          ${user ? `
            ${user.role === 'ADMIN' ? `
              <a href="#/products/add" class="nav-link" style="color:var(--primary); font-weight:700;">+ Produk</a>
              <a href="#/admin/orders" class="nav-link">Admin</a>
            ` : `
              <a href="#/orders" class="nav-link">Transaksi</a>
            `}
          ` : ''}
          
          <a href="#/cart" class="icon-btn cart-btn" title="Keranjang">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            ${count > 0 ? `<span class="badge">${count}</span>` : ''}
          </a>

          ${user ? `
            <div class="user-menu-container">
              <div class="user-menu-trigger">
                <div class="avatar-placeholder" style="background: var(--primary);">
                  ${(user.username || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div class="user-info-mini">
                   <span class="user-name">${user.username || 'User'}</span>
                </div>
              </div>
              
              <div class="user-dropdown">
                 <div class="dropdown-header">
                    <strong>${user.username || user.email.split('@')[0]}</strong>
                    <span class="role-badge">${user.role}</span>
                 </div>
                 ${user.role === 'ADMIN' ? `
                   <a href="#/products/add" class="dropdown-item">Tambah Produk</a>
                   <a href="#/admin/orders" class="dropdown-item">Kelola Pesanan</a>
                   <a href="#/admin/my-products" class="dropdown-item">Produk Saya</a>
                 ` : `
                   <a href="#/orders" class="dropdown-item">Pesanan Saya</a>
                 `}
                 <a href="#/change-password" class="dropdown-item">Ganti Password</a>
                 <div class="dropdown-divider"></div>
                 <a href="#" id="header-logout" class="dropdown-item danger">Logout</a>
              </div>
            </div>
          ` : `
            <div class="auth-buttons">
              <a href="#/register" class="btn-text" style="font-weight: 600;">Daftar</a>
              <div style="width: 1px; height: 16px; background: #ddd;"></div>
              <a href="#/login" class="btn-text" style="font-weight: 600;">Login</a>
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
    render();
  });
}
