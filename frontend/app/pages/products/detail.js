import { State } from '../../core/state.js?v=remon14';

export function ProductDetailPage(params) {
  const id = Number(params.id);
  const html = `
    <div id="product-detail" class="product-detail-wrapper">
      <div class="loading-spinner">Memuat detail produk...</div>
    </div>
  `;

  window.__bindPage = async () => {
    const container = document.getElementById('product-detail');
    if (!container) return;

    try {
      const p = await API.apiGet(`/api/products/${id}`);
      let shopName = null;
      if (p.shopId != null) {
        try {
          const shop = await API.apiGet(`/api/shops/${p.shopId}`);
          if (shop && shop.name) {
            shopName = shop.name;
          }
        } catch (err) {
          console.error('Gagal memuat data toko untuk produk', id, err);
        }
      }
      
      if (!document.getElementById('product-detail')) return;

      let photoUrl = p.photoUrl;
      if (photoUrl && photoUrl.startsWith('/')) {
          const baseUrl = (window.API && window.API.BASE_URL) || 'http://localhost:8081';
          photoUrl = baseUrl + photoUrl;
      }

      const user = State.getUser();
      const isOwner = user && String(user.id) === String(p.ownerId);

      // Prevent setting innerHTML on null if navigated away
      if (!document.getElementById('product-detail')) return;

      container.innerHTML = `
        <div class="pd-container">
          <!-- Left Column: Image -->
          <div class="pd-gallery">
            <div class="pd-main-image">
              ${photoUrl 
                ? `<img src="${photoUrl}" alt="${p.name}" onerror="this.onerror=null;this.src='https://placehold.co/600x600/f1f5f9/94a3b8?text=No+Image';this.alt='No Image';" />` 
                : `<div class="skeleton-image">No Image</div>`
              }
            </div>
          </div>

          <!-- Right Column: Info -->
          <div class="pd-info">
            <h1 class="pd-title">${p.name}</h1>
            ${
              shopName
                ? `<div style="margin-top: 4px; font-size: 14px; color: #64748b;">Toko: ${shopName}</div>`
                : ''
            }
            
            <div class="pd-price-box">
              <span class="pd-currency">Rp</span>
              <span class="pd-price" id="pd-price-text">${Number(p.price).toLocaleString('id-ID')}</span>
              ${
                isOwner
                  ? `<input id="edit-price" type="number" min="0" step="100" class="input"
                       style="display:none; margin-left: 8px; max-width: 160px;"
                       value="${p.price != null ? Number(p.price) : ''}" />`
                  : ''
              }
            </div>

            <div class="pd-section">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <h3 class="pd-section-title" style="margin:0;">Deskripsi Produk</h3>
                ${
                  isOwner
                    ? `<button id="btn-toggle-edit" style="background:none;border:none;color:#2563eb;cursor:pointer;font-size:13px;padding:4px 8px;">
                         Edit
                       </button>`
                    : ''
                }
              </div>
              <div class="pd-description" id="pd-description-text">
                ${p.description || 'Tidak ada deskripsi.'}
              </div>
              ${
                isOwner
                  ? `<textarea id="edit-description" rows="4" class="input"
                        style="width:100%; margin-top:8px; display:none;">${p.description || ''}</textarea>`
                  : ''
              }
              ${
                isOwner
                  ? `
                <div id="edit-controls" style="display:none; margin-top:12px; justify-content:flex-end; gap:8px;">
                  <button id="btn-cancel-edit" class="btn btn-outline-secondary">Batal</button>
                  <button id="btn-save-product" class="btn btn-primary">Simpan Perubahan</button>
                </div>
                <div id="edit-product-message" style="margin-top:8px; font-size:13px; display:none;"></div>
              `
                  : ''
              }
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
                ${isOwner 
                  ? `<div style="width: 100%; text-align: center; padding: 15px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 4px; font-weight: 500;">
                       Anda adalah pemilik produk ini
                     </div>`
                  : `
                    <button id="btn-add-cart" class="btn btn-outline-primary btn-lg">
                      <span class="icon">🛒</span> Masukkan Keranjang
                    </button>
                    <button id="btn-buy-now" class="btn btn-primary btn-lg">
                      Beli Sekarang
                    </button>
                  `
                }
              </div>
            </div>
          </div>
        </div>
      `;

      // Event Listeners
      const qtyInput = document.getElementById('qty-input');
      const btnMinus = document.getElementById('qty-minus');
      const btnPlus = document.getElementById('qty-plus');

      if (qtyInput && btnMinus && btnPlus) {
        btnMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        });

        btnPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            qtyInput.value = val + 1;
        });
      }

      if (isOwner) {
        const toggleBtn = document.getElementById('btn-toggle-edit');
        const btnSave = document.getElementById('btn-save-product');
        const btnCancel = document.getElementById('btn-cancel-edit');
        const inputPrice = document.getElementById('edit-price');
        const inputDesc = document.getElementById('edit-description');
        const msgEl = document.getElementById('edit-product-message');
        const priceTextEl = document.getElementById('pd-price-text');
        const descTextEl = document.getElementById('pd-description-text');
        const controlsEl = document.getElementById('edit-controls');

        const setEditing = (on) => {
          if (toggleBtn) toggleBtn.style.display = on ? 'none' : 'inline-block';
          if (inputPrice) inputPrice.style.display = on ? 'inline-block' : 'none';
          if (inputDesc) inputDesc.style.display = on ? 'block' : 'none';
          if (priceTextEl) priceTextEl.style.display = on ? 'none' : 'inline';
          if (descTextEl) descTextEl.style.display = on ? 'none' : 'block';
          if (controlsEl) controlsEl.style.display = on ? 'flex' : 'none';
        };

        if (toggleBtn) {
          toggleBtn.addEventListener('click', () => {
            if (msgEl) {
              msgEl.style.display = 'none';
              msgEl.textContent = '';
            }
            if (inputDesc) inputDesc.value = p.description || '';
            if (inputPrice) inputPrice.value = p.price != null ? Number(p.price) : '';
            setEditing(true);
          });
        }

        if (btnCancel) {
          btnCancel.addEventListener('click', () => {
            if (msgEl) {
              msgEl.style.display = 'none';
              msgEl.textContent = '';
            }
            if (inputDesc) inputDesc.value = p.description || '';
            if (inputPrice) inputPrice.value = p.price != null ? Number(p.price) : '';
            setEditing(false);
          });
        }

        if (btnSave && inputPrice && inputDesc) {
          btnSave.addEventListener('click', async () => {
            const newDesc = inputDesc.value.trim();
            const newPrice = Number(inputPrice.value);

            if (Number.isNaN(newPrice) || newPrice <= 0) {
              if (msgEl) {
                msgEl.style.display = 'block';
                msgEl.style.color = '#dc2626';
                msgEl.textContent = 'Harga harus lebih dari 0.';
              }
              return;
            }

            try {
              btnSave.disabled = true;
              btnSave.textContent = 'Menyimpan...';

              const body = {
                id: p.id,
                name: p.name,
                price: newPrice,
                description: newDesc,
                photoUrl: p.photoUrl,
                ownerId: p.ownerId,
                shopId: p.shopId
              };

              const updated = await API.apiPut(`/api/products/${p.id}?requesterId=${user.id}`, body);

              if (priceTextEl && updated.price != null) {
                priceTextEl.textContent = Number(updated.price).toLocaleString('id-ID');
              }

              if (descTextEl) {
                descTextEl.textContent = updated.description || 'Tidak ada deskripsi.';
              }

              p.price = updated.price;
              p.description = updated.description;

              if (msgEl) {
                msgEl.style.display = 'block';
                msgEl.style.color = '#16a34a';
                msgEl.textContent = 'Perubahan produk tersimpan.';
              }

              setEditing(false);
            } catch (e) {
              if (msgEl) {
                msgEl.style.display = 'block';
                msgEl.style.color = '#dc2626';
                msgEl.textContent = 'Gagal menyimpan: ' + e.message;
              }
            } finally {
              btnSave.disabled = false;
              btnSave.textContent = 'Simpan Perubahan';
            }
          });
        }
      } else {
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
          window.location.href = '/checkout'; // Go to checkout directly
        });
      }

    } catch (e) {
      container.innerHTML = `<div class="panel error">Gagal memuat produk: ${e.message}</div>`;
    }
  };

  return html;
}
