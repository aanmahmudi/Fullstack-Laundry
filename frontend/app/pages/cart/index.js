import { State } from '../../core/state.js';

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
        const items = State.getCart();
        if (!items.length) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <p style="margin-bottom: 20px; color: #64748b;">Keranjang belanja Anda kosong.</p>
                    <a href="#/products" class="btn btn-primary">Mulai Belanja</a>
                </div>
            `;
        } else {
            const total = items.reduce((sum, x) => sum + (x.price * (x.qty || 1)), 0);
            container.innerHTML = `
            <div class="cart-container">
                <div class="cart-items-list">
                ${items.map((x, i) => `
                    <div class="cart-item">
                    <div class="cart-item-thumb" style="margin-right:12px;">
                        <img src="${x.photoUrl || 'https://placehold.co/80x80/f1f5f9/94a3b8?text=No+Image'}" alt="${x.name}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;background:#fff;" />
                    </div>
                    <div class="cart-item-info">
                        <h3 class="cart-item-title">${x.name}</h3>
                        <div class="cart-item-price">Rp ${Number(x.price).toLocaleString('id-ID')}</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="qty-control small">
                        <button data-i="${i}" class="btn-dec">-</button>
                        <span class="qty-val">${x.qty || 1}</span>
                        <button data-i="${i}" class="btn-inc">+</button>
                        </div>
                        <button data-i="${i}" class="btn-del-icon" title="Hapus">✕</button>
                    </div>
                    </div>
                `).join('')}
                </div>
                
                <div class="cart-summary">
                    <div class="summary-row">
                    <span>Total Item</span>
                    <span>${items.reduce((s, x) => s + (x.qty || 1), 0)}</span>
                    </div>
                    <div class="summary-row total">
                    <span>Total Bayar</span>
                    <span>Rp ${total.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="summary-actions">
                    <a class="btn btn-primary btn-block" href="#/checkout">Checkout Sekarang</a>
                    <button id="btn-clear" class="btn btn-ghost btn-block">Kosongkan Keranjang</button>
                    </div>
                </div>
            </div>
            `;
            
            // Attach listeners
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
                    if(confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
                        State.clearCart();
                        render(); // Re-render immediately
                    }
                });
            }
        }
    };

    render();
  };

  return html;
}
