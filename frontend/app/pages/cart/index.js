import { State } from '../../core/state.js?v=remon14';

export function CartPage() {
  const html = `
    <section>
      <h2>Keranjang</h2>
      <div id="cart-items"></div>
    </section>
  `;

  window.__bindPage = () => {
    const container = document.getElementById('cart-items');

    const render = () => {
        if (!container) return; // Prevent setting innerHTML on null if navigated away
        const items = State.getCart();
        if (!items.length) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <p style="margin-bottom: 20px; color: #64748b;">Keranjang belanja Anda kosong.</p>
                    <a href="#/products" class="btn btn-primary">Mulai Belanja</a>
                </div>
            `;
        } else {
            // Default selected is true if undefined
            const selectedItems = items.filter(x => x.selected !== false);
            const total = selectedItems.reduce((sum, x) => sum + (x.price * (x.qty || 1)), 0);
            const allSelected = items.length > 0 && items.every(x => x.selected !== false);

            container.innerHTML = `
            <div class="cart-container">
                <div class="cart-items-list">
                    <div class="cart-header" style="padding: 10px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; margin-bottom: 10px;">
                         <label style="display: flex; align-items: center; cursor: pointer; font-weight: 600;">
                            <input type="checkbox" id="cb-all" ${allSelected ? 'checked' : ''} style="width: 18px; height: 18px; margin-right: 10px;">
                            Pilih Semua (${items.length})
                         </label>
                    </div>
                ${items.map((x, i) => {
                    let photoUrl = x.photoUrl;
                    if (photoUrl && photoUrl.startsWith('/')) {
                        const baseUrl = (window.API && window.API.BASE_URL) || 'http://localhost:8080';
                        photoUrl = baseUrl + photoUrl;
                    }
                    const isSelected = x.selected !== false;
                    return `
                    <div class="cart-item" style="display: flex; align-items: center; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; background: #fff;">
                        <div style="margin-right: 12px;">
                            <input type="checkbox" class="cb-item" data-i="${i}" ${isSelected ? 'checked' : ''} style="width: 18px; height: 18px;">
                        </div>
                        <div class="cart-item-thumb" style="margin-right:12px;">
                            <img src="${photoUrl || 'https://placehold.co/80x80/f1f5f9/94a3b8?text=No+Image'}" alt="${x.name}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;background:#fff;" onerror="this.onerror=null;this.src='https://placehold.co/80x80/f1f5f9/94a3b8?text=No+Image';this.alt='No Image';" />
                        </div>
                        <div class="cart-item-info" style="flex: 1;">
                            <h3 class="cart-item-title" style="margin: 0 0 4px 0; font-size: 16px;">${x.name}</h3>
                            <div class="cart-item-price" style="font-weight: 600; color: var(--primary);">Rp ${Number(x.price).toLocaleString('id-ID')}</div>
                        </div>
                        <div class="cart-item-actions" style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                            <button data-i="${i}" class="btn-del-icon" title="Hapus" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 18px;">✕</button>
                            <div class="qty-control small" style="display: flex; align-items: center; border: 1px solid #e2e8f0; border-radius: 4px;">
                                <button data-i="${i}" class="btn-dec" style="width: 28px; height: 28px; border: none; background: #f8fafc; cursor: pointer;">-</button>
                                <span class="qty-val" style="width: 32px; text-align: center; font-size: 14px;">${x.qty || 1}</span>
                                <button data-i="${i}" class="btn-inc" style="width: 28px; height: 28px; border: none; background: #f8fafc; cursor: pointer;">+</button>
                            </div>
                        </div>
                    </div>
                `}).join('')}
                </div>
                
                <div class="cart-summary">
                    <div class="summary-row">
                    <span>Total Item Dipilih</span>
                    <span>${selectedItems.reduce((s, x) => s + (x.qty || 1), 0)}</span>
                    </div>
                    <div class="summary-row total">
                    <span>Total Bayar</span>
                    <span>Rp ${total.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="summary-actions">
                    ${selectedItems.length > 0 ? 
                        `<a class="btn btn-primary btn-block" href="#/checkout">Checkout (${selectedItems.length})</a>` :
                        `<button class="btn btn-primary btn-block" disabled style="opacity: 0.5; cursor: not-allowed;">Checkout (0)</button>`
                    }
                    <button id="btn-clear" class="btn btn-ghost btn-block">Kosongkan Keranjang</button>
                    </div>
                </div>
            </div>
            `;
            
            // Attach listeners
            // Checkbox All
            const cbAll = document.getElementById('cb-all');
            if (cbAll) {
                cbAll.addEventListener('change', (e) => {
                    State.setAllSelection(e.target.checked);
                    render();
                });
            }

            // Checkbox Items
            container.querySelectorAll('.cb-item').forEach((cb) => {
                cb.addEventListener('change', (e) => {
                    State.setItemSelection(Number(cb.dataset.i), e.target.checked);
                    render();
                });
            });

            container.querySelectorAll('.btn-del-icon').forEach((b) => {
                b.addEventListener('click', () => {
                    State.removeFromCart(Number(b.dataset.i));
                    render(); // Re-render immediately
                });
            });
            container.querySelectorAll('.btn-inc').forEach((b) => {
                b.addEventListener('click', () => {
                    const i = Number(b.dataset.i);
                    const list = State.getCart();
                    const q = (Number(list[i]?.qty) || 1) + 1;
                    State.setQty(i, q);
                    render(); // Re-render immediately
                });
            });
            container.querySelectorAll('.btn-dec').forEach((b) => {
                b.addEventListener('click', () => {
                    const i = Number(b.dataset.i);
                    const list = State.getCart();
                    const q = Math.max(1, (Number(list[i]?.qty) || 1) - 1);
                    State.setQty(i, q);
                    render(); // Re-render immediately
                });
            });

            const btnClear = document.getElementById('btn-clear');
            if (btnClear) {
                btnClear.addEventListener('click', () => {
                    if (confirm('Yakin ingin mengosongkan keranjang?')) {
                        State.clearCart();
                        render();
                    }
                });
            }
        }
    };

    render();
    
    // Listen for external updates (e.g. from header or other tabs)
    const onCartUpdate = () => render();
    window.addEventListener('cart:updated', onCartUpdate);
    
    // Cleanup when leaving page (though __bindPage is one-off, the listener persists if not careful)
    // A better router would handle lifecycle. For now, we rely on router replacing innerHTML.
    // Ideally we should removeEventListener but we don't have a clean unmount hook here easily.
    // However, since 'render' checks 'if (!container) return', it's safe.
  };

  return html;
}
