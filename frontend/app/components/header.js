import { navigate } from '../core/router.js';
import { State } from '../core/state.js';

export function renderHeader(el) {
  const count = State.getCart().reduce((s, x) => s + (Number(x.qty) || 1), 0);
  el.innerHTML = `
    <nav class="nav">
      <div class="nav-left">
        <a class="brand" href="#/">Laundry</a>
        <a href="#/products">Produk</a>
        <a href="#/orders">Pesanan</a>
      </div>
      <div class="nav-center">
        <form id="global-search" class="searchbar">
          <input id="global-search-input" type="text" placeholder="Cari produk..." aria-label="Cari produk" />
          <button class="btn primary" type="submit">Cari</button>
        </form>
      </div>
      <div class="nav-right">
        <a href="#/cart">Keranjang <span class="badge">${count}</span></a>
        <a href="#/auth">Akun</a>
      </div>
    </nav>
  `;

  el.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      navigate(a.getAttribute('href'));
    });
  });

  window.addEventListener('cart:updated', (e) => {
    const badge = el.querySelector('.badge');
    if (badge) badge.textContent = e.detail.count;
  });

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