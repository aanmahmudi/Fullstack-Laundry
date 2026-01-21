import { State } from '../../core/state.js';

export function ProductDetailPage(params) {
  const id = Number(params.id);
  const html = `
    <section>
      <div id="product-detail" class="detail"></div>
    </section>
  `;

  window.__bindPage = async () => {
    const container = document.getElementById('product-detail');
    container.innerHTML = '<div class="loading">Memuat detail produk...</div>';
    try {
      const p = await API.apiGet(`/api/products/${id}`);
      container.innerHTML = `
        <h2>${p.name}</h2>
        <p>${p.description || ''}</p>
        <div class="price">Rp ${p.price}</div>
        <div class="actions">
          <button id="btn-add" class="btn primary">Tambah ke Keranjang</button>
          <a class="btn ghost" href="#/products">Kembali</a>
        </div>
      `;
      document.getElementById('btn-add').addEventListener('click', () => {
        State.addToCart({ id: p.id, name: p.name, price: p.price, qty: 1 });
      });
    } catch (e) {
      container.innerHTML = `<div class="error">${e.message}</div>`;
    }
  };

  return html;
}
