import { State } from '../core/state.js';

export function ProductsPage() {
  const html = `
  <section class="columns">
    <div class="col">
      <h2>Produk</h2>
      <div class="actions">
        <input id="search" class="input" placeholder="Cari produk..."/>
        <button id="btn-refresh" class="btn">Refresh</button>
      </div>
      <div id="products-grid" class="grid"></div>
    </div>
    <aside class="col sidebar">
      <div class="panel stack">
        <h3>Ringkasan Keranjang</h3>
        <div id="cart-summary" class="muted">Keranjang kosong.</div>
        <div class="actions">
          <a class="btn" href="#/cart">Lihat Keranjang</a>
          <a class="btn primary" href="#/checkout">Checkout</a>
        </div>
      </div>
    </aside>
  </section>`;

  window.__bindPage = async () => {
    const grid = document.getElementById('products-grid');
    const search = document.getElementById('search');
    const refresh = document.getElementById('btn-refresh');
    grid.innerHTML = '<div class="loading">Memuat produk...</div>';
    try {
      let items = await API.apiGet('/api/products');
      const render = (list) => {
        grid.innerHTML = list.map((p) => productCard(p)).join('');
        grid.querySelectorAll('.btn-add').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            const prod = list.find((x) => x.id === id) || items.find((x) => x.id === id);
            if (prod) State.addToCart({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
          });
        });
      };
      render(items);
      renderCartSummary();
      const doFilter = (q) => {
        const query = String(q || '').toLowerCase();
        const filtered = items.filter((p) =>
          String(p.name || '').toLowerCase().includes(query) || String(p.description || '').toLowerCase().includes(query)
        );
        render(filtered);
      };
      search.addEventListener('input', () => {
        doFilter(search.value);
      });
      // Dengarkan pencarian global dari header
      window.addEventListener('global:search', (e) => {
        const q = e.detail && e.detail.q ? e.detail.q : '';
        if (search) search.value = q;
        doFilter(q);
      });
      refresh.addEventListener('click', async () => {
        grid.innerHTML = '<div class="loading">Memuat produk...</div>';
        items = await API.apiGet('/api/products');
        search.value = '';
        render(items);
        renderCartSummary();
      });
      window.addEventListener('cart:updated', renderCartSummary);
    } catch (e) {
      grid.innerHTML = `<div class="error">${e.message}</div>`;
    }
  };

  return html;
}

function productCard(p) {
  return `
    <article class="card">
      <figure class="thumb">${p.photoUrl ? `<img src="${p.photoUrl}" alt="${p.name}"/>` : '<div class="skeleton block"></div>'}</figure>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.description || ''}</p>
        <div class="price">Rp ${p.price}</div>
      </div>
      <div class="card-actions">
        <a class="btn" href="#/product/${p.id}">Detail</a>
        <button class="btn primary btn-add" data-id="${p.id}">Tambah ke Keranjang</button>
      </div>
    </article>
  `;
}

function renderCartSummary() {
  const el = document.getElementById('cart-summary');
  if (!el) return;
  const items = State.getCart();
  if (!items.length) { el.textContent = 'Keranjang kosong.'; return; }
  const count = items.reduce((s, x) => s + (Number(x.qty) || 1), 0);
  const total = items.reduce((s, x) => s + (x.price * (x.qty || 1)), 0);
  el.innerHTML = `<p>Total item: <strong>${count}</strong></p><p>Total harga: <strong>Rp ${total}</strong></p>`;
}