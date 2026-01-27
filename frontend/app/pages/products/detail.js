import { State } from '../../core/state.js';

export function ProductDetailPage(params) {
  const id = Number(params.id);
  const html = `
    <div id="product-detail" class="product-detail-wrapper">
      <div class="loading-spinner">Memuat detail produk...</div>
    </div>
  `;

  window.__bindPage = async () => {
    const container = document.getElementById('product-detail');
    try {
      const p = await API.apiGet(`/api/products/${id}`);
      
      container.innerHTML = `
        <div class="pd-container">
          <!-- Left Column: Image -->
          <div class="pd-gallery">
            <div class="pd-main-image">
               ${p.photoUrl 
                 ? `<img src="${p.photoUrl}" alt="${p.name}" />` 
                 : `<div class="skeleton-image">No Image</div>`
               }
            </div>
          </div>

          <!-- Right Column: Info -->
          <div class="pd-info">
            <h1 class="pd-title">${p.name}</h1>
            
            <div class="pd-price-box">
              <span class="pd-currency">Rp</span>
              <span class="pd-price">${Number(p.price).toLocaleString('id-ID')}</span>
            </div>

            <div class="pd-section">
              <h3 class="pd-section-title">Deskripsi Produk</h3>
              <div class="pd-description">
                ${p.description || 'Tidak ada deskripsi.'}
              </div>
            </div>

            <div class="pd-actions">
              <div class="pd-quantity">
                <label>Kuantitas</label>
                <div class="qty-control">
                  <button id="qty-minus">-</button>
                  <input type="number" id="qty-input" value="1" min="1" />
                  <button id="qty-plus">+</button>
                </div>
              </div>

              <div class="pd-buttons">
                <button id="btn-add-cart" class="btn btn-outline-primary btn-lg">
                  <span class="icon">🛒</span> Masukkan Keranjang
                </button>
                <button id="btn-buy-now" class="btn btn-primary btn-lg">
                  Beli Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Event Listeners
      const qtyInput = document.getElementById('qty-input');
      const btnMinus = document.getElementById('qty-minus');
      const btnPlus = document.getElementById('qty-plus');

      btnMinus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = val - 1;
      });

      btnPlus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value) || 1;
        qtyInput.value = val + 1;
      });

      document.getElementById('btn-add-cart').addEventListener('click', () => {
        const qty = parseInt(qtyInput.value) || 1;
        State.addToCart({ id: p.id, name: p.name, price: p.price, qty: qty, photoUrl: p.photoUrl });
        
        // Visual feedback
        const btn = document.getElementById('btn-add-cart');
        const originalContent = btn.innerHTML;
        btn.innerHTML = `<span class="icon">✓</span> Masuk Keranjang`;
        btn.classList.add('btn-success');
        btn.style.backgroundColor = '#22c55e';
        btn.style.color = 'white';
        btn.style.borderColor = '#22c55e';
        
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.remove('btn-success');
            btn.style.backgroundColor = '';
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 1500);
      });

      document.getElementById('btn-buy-now').addEventListener('click', () => {
        const qty = parseInt(qtyInput.value) || 1;
        State.addToCart({ id: p.id, name: p.name, price: p.price, qty: qty, photoUrl: p.photoUrl });
        window.location.hash = '#/checkout'; // Go to checkout directly
      });

    } catch (e) {
      container.innerHTML = `<div class="panel error">Gagal memuat produk: ${e.message}</div>`;
    }
  };

  return html;
}
