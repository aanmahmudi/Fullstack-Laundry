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
      let shopId = p.shopId || null;
      let sellerPhone = null;

      if (shopId != null) {
        try {
          const shop = await API.apiGet(`/api/shops/${shopId}`);
          if (shop && shop.name) {
            shopName = shop.name;
          }
          if (shop && shop.ownerId) {
            try {
              const owner = await API.apiGet(`/api/customers/${shop.ownerId}`);
              if (owner && owner.phoneNumber) {
                sellerPhone = owner.phoneNumber;
              }
            } catch (err) {
              console.error('Gagal memuat data pemilik toko', shop.ownerId, err);
            }
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

      const rawSizes = typeof p.sizes === 'string' ? p.sizes : '';
      const sizeOptions = rawSizes
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const rawColors = typeof p.colors === 'string' ? p.colors : '';
      const colorOptions = rawColors
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

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

            ${
              shopName
                ? `
            <div class="pd-section" style="border:1px solid #e5e7eb; border-radius:6px; padding:12px 14px; display:flex; align-items:center; justify-content:space-between; gap:12px; background:#fafafa; margin-top:4px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:36px;height:36px;border-radius:999px;background:#111827;color:#f9fafb;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;overflow:hidden;">
                  ${(shopName || 'Toko').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style="font-weight:600;font-size:14px;color:#111827;">${shopName}</div>
                  <div style="font-size:12px;color:#9ca3af;">Toko resmi di Remon Mall</div>
                </div>
              </div>
              <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
                ${isOwner 
                  ? `<button id="btn-view-inbox" class="btn" style="background:#22c55e;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:13px;display:flex;align-items:center;gap:6px;">
                       <span>📩</span><span>Lihat Pesan Masuk</span>
                     </button>`
                  : `<button id="btn-chat-seller" class="btn" style="background:#f97316;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:13px;display:flex;align-items:center;gap:6px;">
                       <span>💬</span><span>Chat Sekarang</span>
                     </button>`
                }
                <a href="${shopId != null ? `/shops/${shopId}` : '#'}" id="btn-visit-shop" class="btn" style="border:1px solid #d1d5db;color:#111827;padding:6px 12px;border-radius:4px;font-size:13px;text-decoration:none;display:flex;align-items:center;gap:6px;">
                  <span>🏬</span><span>Kunjungi Toko</span>
                </a>
              </div>
            </div>
                `
                : ''
            }

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

            <div class="pd-section">
              <h3 class="pd-section-title" style="margin:0 0 4px 0;">Ukuran</h3>
              ${
                !isOwner && sizeOptions.length
                  ? `
                <div style="margin-top:8px;">
                  <div style="font-size:13px; color:#4b5563; margin-bottom:4px;">Pilih ukuran</div>
                  <div id="size-choices" class="pd-size-choice-group">
                    ${sizeOptions
                      .map(
                        (s, idx) => `
                          <button
                            type="button"
                            class="pd-size-pill ${idx === 0 ? 'active' : ''}"
                            data-size="${s}"
                          >
                            ${s}
                          </button>
                        `
                      )
                      .join('')}
                  </div>
                </div>`
                  : ''
              }
              ${
                isOwner
                  ? `<input id="edit-sizes" type="text" class="input"
                        style="width:100%; margin-top:8px; display:none;"
                        placeholder="Contoh: S,M,L atau 30x30,40x40"
                        value="${rawSizes}" />`
                  : ''
              }
            </div>

            <div class="pd-section">
              <h3 class="pd-section-title" style="margin:0 0 4px 0;">Warna</h3>
              ${
                !isOwner && colorOptions.length
                  ? `
                <div style="margin-top:8px;">
                  <div style="font-size:13px; color:#4b5563; margin-bottom:4px;">Pilih warna</div>
                  <div id="color-choices" class="pd-size-choice-group">
                    ${colorOptions
                      .map(
                      (c, idx) => `
                          <button
                          type="button"
                          class="pd-color-pill ${idx === 0 ? 'active' : ''}"
                          data-color="${c}"
                          >
                            ${c}
                          </button>
                        `
                      )
                      .join('')}
                  </div>
                </div>`
                  : ''
              }
              ${
                isOwner
                  ? `<input id="edit-colors" type="text" class="input"
                        style="width:100%; margin-top:8px; display:none;"
                        placeholder="Contoh: Hitam, Putih, Abu, Cream, Merah"
                        value="${rawColors}" />`
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
                    <button id="btn-add-cart" class="btn-shopee-cart">
                      <span class="icon">🛒</span> Masukkan Keranjang
                    </button>
                    <button id="btn-buy-now" class="btn-shopee-buy">
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
      const btnViewInbox = document.getElementById('btn-view-inbox');
      if (btnViewInbox) {
        btnViewInbox.addEventListener('click', () => {
          if (shopId) {
            window.location.href = `/admin/shops/${shopId}?openChat=true`;
          } else {
            alert('Toko tidak ditemukan.');
          }
        });
      }

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

      let selectedSize = sizeOptions.length ? sizeOptions[0] : null;
      let selectedColor = colorOptions.length ? colorOptions[0] : null;

      if (!isOwner && sizeOptions.length) {
        const sizeButtons = document.querySelectorAll('.pd-size-pill');
        if (sizeButtons.length) {
          sizeButtons.forEach((btn) => {
            const value = btn.dataset.size;
            if (value === (p.selectedSize || selectedSize)) {
              selectedSize = value;
              sizeButtons.forEach((b) => b.classList.remove('active'));
              btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
              selectedSize = value;
              sizeButtons.forEach((b) => b.classList.remove('active'));
              btn.classList.add('active');
            });
          });
        }
      }

      if (!isOwner && colorOptions.length) {
        const colorButtons = document.querySelectorAll('.pd-color-pill');
        if (colorButtons.length) {
          colorButtons.forEach((btn) => {
            const value = btn.dataset.color;
            if (value === (p.selectedColor || selectedColor)) {
              selectedColor = value;
              colorButtons.forEach((b) => b.classList.remove('active'));
              btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
              selectedColor = value;
              colorButtons.forEach((b) => b.classList.remove('active'));
              btn.classList.add('active');
            });
          });
        }
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
        const inputSizes = document.getElementById('edit-sizes');
        const inputColors = document.getElementById('edit-colors');
        const sizesTextEl = document.getElementById('pd-sizes-text');
        const colorsTextEl = document.getElementById('pd-colors-text');

        const setEditing = (on) => {
          if (toggleBtn) toggleBtn.style.display = on ? 'none' : 'inline-block';
          if (inputPrice) inputPrice.style.display = on ? 'inline-block' : 'none';
          if (inputDesc) inputDesc.style.display = on ? 'block' : 'none';
          if (inputSizes) inputSizes.style.display = on ? 'block' : 'none';
          if (inputColors) inputColors.style.display = on ? 'block' : 'none';
          if (priceTextEl) priceTextEl.style.display = on ? 'none' : 'inline';
          if (descTextEl) descTextEl.style.display = on ? 'none' : 'block';
          if (sizesTextEl) sizesTextEl.style.display = on ? 'none' : 'block';
          if (colorsTextEl) colorsTextEl.style.display = on ? 'none' : 'block';
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
            if (inputSizes) inputSizes.value = rawSizes;
            if (inputColors) inputColors.value = rawColors;
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
            if (inputSizes) inputSizes.value = rawSizes;
            if (inputColors) inputColors.value = rawColors;
            setEditing(false);
          });
        }

        if (btnSave && inputPrice && inputDesc) {
          btnSave.addEventListener('click', async () => {
            const newDesc = inputDesc.value.trim();
            const newPrice = Number(inputPrice.value);
            const newSizes = inputSizes ? inputSizes.value.trim() : rawSizes;
            const newColors = inputColors ? inputColors.value.trim() : rawColors;

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
                sizes: newSizes || null,
                colors: newColors || null,
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
              if (sizesTextEl) {
                const updatedSizes = updated.sizes || newSizes || '';
                const arrSizes = typeof updatedSizes === 'string'
                  ? updatedSizes.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
                  : [];
                sizesTextEl.textContent = arrSizes.length ? arrSizes.join(', ') : 'Tidak ada ukuran khusus.';
              }
              if (colorsTextEl) {
                const updatedColors = updated.colors || newColors || '';
                const arrColors = typeof updatedColors === 'string'
                  ? updatedColors.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
                  : [];
                colorsTextEl.textContent = arrColors.length ? arrColors.join(', ') : 'Tidak ada variasi warna.';
              }

              p.price = updated.price;
              p.description = updated.description;
              p.sizes = updated.sizes || newSizes;
              p.colors = updated.colors || newColors;

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
          State.addToCart({
            id: p.id,
            name: p.name,
            price: p.price,
            qty: qty,
            photoUrl: p.photoUrl,
            selectedSize,
            selectedColor
          });
          
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
          State.addToCart({
            id: p.id,
            name: p.name,
            price: p.price,
            qty: qty,
            photoUrl: p.photoUrl,
            selectedSize,
            selectedColor
          });
          window.location.href = '/checkout'; // Go to checkout directly
        });
      }

      if (shopName) {
        const chatBtn = document.getElementById('btn-chat-seller');
        if (chatBtn) {
          const openChatDrawer = () => {
            const defaultMessage = `Halo, saya tertarik dengan produk ini:\n\nNama Produk: ${p.name}\nHarga: Rp ${Number(p.price || 0).toLocaleString('id-ID')}`;

            let overlay = document.getElementById('chat-drawer-overlay');
            if (!overlay) {
              overlay = document.createElement('div');
              overlay.id = 'chat-drawer-overlay';
              overlay.style.position = 'fixed';
              overlay.style.bottom = '16px';
              overlay.style.right = '16px';
              overlay.style.width = '360px';
              overlay.style.height = 'auto';
              overlay.style.maxHeight = '80vh';
              overlay.style.display = 'flex';
              overlay.style.justifyContent = 'flex-end';
              overlay.style.alignItems = 'flex-end';
              overlay.style.zIndex = '9999';
              overlay.style.background = 'transparent';

              overlay.innerHTML = `
                <div class="chat-drawer-panel" style="width:100%;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;display:flex;flex-direction:column;box-shadow:0 10px 30px rgba(15,23,42,0.25);max-height:80vh;">
                  <div style="padding:12px 14px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;">
                    <div>
                      <div style="font-size:14px;font-weight:600;color:#111827;">Chat</div>
                      <div style="font-size:12px;color:#6b7280;">${shopName}</div>
                    </div>
                    <button type="button" class="chat-drawer-close" style="border:none;background:transparent;color:#6b7280;font-size:18px;cursor:pointer;">×</button>
                  </div>
                  <div style="padding:12px 14px;border-bottom:1px solid #f3f4f6;display:flex;gap:10px;align-items:center;">
                    <div style="width:40px;height:40px;border-radius:8px;border:1px solid #e5e7eb;overflow:hidden;background:#f9fafb;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#111827;">
                      ${(p.name || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div style="flex:1;min-width:0;">
                      <div style="font-size:13px;font-weight:500;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                      <div style="font-size:12px;color:#ef4444;font-weight:600;">Rp ${Number(p.price || 0).toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                  <div style="display:flex;flex-direction:column;padding:12px 14px;gap:8px;">
                    <div id="chat-thread" style="max-height:230px;border-radius:8px;background:#f9fafb;padding:8px 10px;overflow-y:auto;font-size:12px;color:#6b7280;">
                      <div style="font-size:12px;color:#9ca3af;">Memuat percakapan...</div>
                    </div>
                    <div style="border-radius:8px;border:1px solid #d1d5db;padding:8px 10px;display:flex;flex-direction:column;gap:6px;">
                      <textarea id="chat-input-msg" rows="3" style="width:100%;border:none;outline:none;font-size:12px;resize:vertical;min-height:60px;max-height:120px;box-sizing:border-box;" placeholder="Tulis pesan ke penjual..."></textarea>
                      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                        <div id="chat-send-status" style="font-size:11px;color:#16a34a;display:none;"></div>
                        <div style="display:flex;gap:8px;">
                          <button type="button" class="chat-drawer-close" style="border:1px solid #d1d5db;background:white;color:#374151;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;">Batal</button>
                          <button type="button" class="chat-drawer-send" style="border:none;background:#22c55e;color:white;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
                            <span>📩</span><span>Kirim ke Toko</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;

              document.body.appendChild(overlay);

              const closeButtons = overlay.querySelectorAll('.chat-drawer-close');
              closeButtons.forEach((btn) => {
                btn.addEventListener('click', () => {
                  overlay.style.display = 'none';
                });
              });

              overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                  overlay.style.display = 'none';
                }
              });

              const loadThread = async () => {
                const threadEl = overlay.querySelector('#chat-thread');
                const user = State.getUser();
                if (!threadEl || !user || !p.shopId) return;
                try {
                  const items = await API.apiGet(`/api/shops/${p.shopId}/messages/thread?customerId=${user.id}`);
                  if (!items || items.length === 0) {
                    threadEl.innerHTML = `<div style="font-size:12px;color:#9ca3af;">Belum ada percakapan. Kirim pesan pertama ke penjual.</div>`;
                    const textarea = overlay.querySelector('#chat-input-msg');
                    if (textarea && !textarea.value.trim()) {
                        textarea.value = defaultMessage;
                    }
                    return;
                  }
                  threadEl.innerHTML = items
                    .map((m) => {
                      const isMe = !m.fromAdmin;
                      const time = m.createdAt ? new Date(m.createdAt).toLocaleString('id-ID') : '';
                      return `
                        <div style="display:flex;margin-bottom:6px;${isMe ? 'justify-content:flex-end;' : 'justify-content:flex-start;'}">
                          <div style="max-width:75%;padding:6px 8px;border-radius:8px;background:${isMe ? '#22c55e' : '#ffffff'};color:${isMe ? '#ffffff' : '#111827'};font-size:12px;white-space:pre-line;box-shadow:0 1px 2px rgba(15,23,42,0.08);">
                            <div>${m.content}</div>
                            <div style="font-size:10px;opacity:0.7;margin-top:2px;text-align:${isMe ? 'right' : 'left'};">${time}</div>
                          </div>
                        </div>
                      `;
                    })
                    .join('');
                  threadEl.scrollTop = threadEl.scrollHeight;
                } catch (err) {
                  threadEl.innerHTML = `<div style="font-size:12px;color:#dc2626;">Gagal memuat percakapan: ${err.message}</div>`;
                }
              };

              const sendBtn = overlay.querySelector('.chat-drawer-send');
              const statusEl = overlay.querySelector('#chat-send-status');
              if (sendBtn) {
                sendBtn.addEventListener('click', async () => {
                  const textarea = overlay.querySelector('#chat-input-msg');
                  const finalMessage = textarea && textarea.value ? textarea.value : defaultMessage;
                  if (statusEl) {
                    statusEl.textContent = 'Mengirim pesan...';
                    statusEl.style.display = 'block';
                  }
                  try {
                    const user = State.getUser();
                    if (!user) {
                      throw new Error('Silakan login terlebih dahulu.');
                    }
                    if (!p.shopId) {
                      throw new Error('Toko untuk produk ini tidak ditemukan.');
                    }
                    await API.apiPost(`/api/shops/${p.shopId}/messages`, {
                      senderCustomerId: user.id,
                      content: finalMessage,
                      fromAdmin: false
                    });
                    if (statusEl) {
                      statusEl.textContent = 'Pesan terkirim ke toko.';
                    }
                    if (textarea) {
                      textarea.value = '';
                    }
                    loadThread();
                  } catch (err) {
                    if (statusEl) {
                      statusEl.textContent = err.message || 'Gagal mengirim pesan.';
                      statusEl.style.color = '#dc2626';
                    }
                  }
                });
              }
              loadThread();
            } else {
              const textarea = overlay.querySelector('#chat-input-msg');
              // Only set default message if textarea is empty and history check later confirms no messages
              // Wait for async check below
              
              const threadEl = overlay.querySelector('#chat-thread');
              if (threadEl) {
                threadEl.innerHTML = `<div style="font-size:12px;color:#9ca3af;">Memuat percakapan...</div>`;
              }
              const user = State.getUser();
              if (user && p.shopId) {
                (async () => {
                  try {
                    const items = await API.apiGet(`/api/shops/${p.shopId}/messages/thread?customerId=${user.id}`);
                    const tEl = overlay.querySelector('#chat-thread');
                    if (!tEl) return;
                    if (!items || items.length === 0) {
                      tEl.innerHTML = `<div style="font-size:12px;color:#9ca3af;">Belum ada percakapan. Kirim pesan pertama ke penjual.</div>`;
                      if (textarea && !textarea.value.trim()) {
                          textarea.value = defaultMessage;
                      }
                      return;
                    }
                    tEl.innerHTML = items
                      .map((m) => {
                        const isMe = !m.fromAdmin;
                        const time = m.createdAt ? new Date(m.createdAt).toLocaleString('id-ID') : '';
                        return `
                          <div style="display:flex;margin-bottom:6px;${isMe ? 'justify-content:flex-end;' : 'justify-content:flex-start;'}">
                            <div style="max-width:75%;padding:6px 8px;border-radius:8px;background:${isMe ? '#22c55e' : '#ffffff'};color:${isMe ? '#ffffff' : '#111827'};font-size:12px;white-space:pre-line;box-shadow:0 1px 2px rgba(15,23,42,0.08);">
                              <div>${m.content}</div>
                              <div style="font-size:10px;opacity:0.7;margin-top:2px;text-align:${isMe ? 'right' : 'left'};">${time}</div>
                            </div>
                          </div>
                        `;
                      })
                      .join('');
                    tEl.scrollTop = tEl.scrollHeight;
                  } catch (err) {
                    const tEl = overlay.querySelector('#chat-thread');
                    if (tEl) {
                      tEl.innerHTML = `<div style="font-size:12px;color:#dc2626;">Gagal memuat percakapan: ${err.message}</div>`;
                    }
                  }
                })();
              }
            }

            overlay.style.display = 'flex';
          };

          chatBtn.addEventListener('click', openChatDrawer);

          let chatFab = document.getElementById('global-chat-fab');
          if (!chatFab) {
            chatFab = document.createElement('button');
            chatFab.id = 'global-chat-fab';
            chatFab.type = 'button';
            chatFab.style.position = 'fixed';
            chatFab.style.bottom = '16px';
            chatFab.style.right = '16px';
            chatFab.style.zIndex = '9998';
            chatFab.style.border = 'none';
            chatFab.style.borderRadius = '999px';
            chatFab.style.background = '#22c55e';
            chatFab.style.color = 'white';
            chatFab.style.padding = '8px 14px';
            chatFab.style.fontSize = '13px';
            chatFab.style.display = 'flex';
            chatFab.style.alignItems = 'center';
            chatFab.style.gap = '6px';
            chatFab.style.boxShadow = '0 6px 18px rgba(15,23,42,0.3)';
            chatFab.style.cursor = 'pointer';
            chatFab.innerHTML = '<span>💬</span><span>Chat</span>';
            document.body.appendChild(chatFab);
          }

          chatFab.addEventListener('click', openChatDrawer);
        }
      }

    } catch (e) {
      container.innerHTML = `<div class="panel error">Gagal memuat produk: ${e.message}</div>`;
    }
  };

  return html;
}
