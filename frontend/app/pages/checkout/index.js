import { State } from '../../core/state.js';

export function CheckoutPage() {
  const items = State.getCart();
  const user = State.getUser();
  const total = items.reduce((sum, x) => sum + (x.price * (x.qty || 1)), 0);
  
  // If not logged in, redirect to login
  if (!user) {
    window.location.hash = '#/login';
    return '';
  }

  const html = `
    <div class="checkout-container" style="display: grid; grid-template-columns: 1fr 350px; gap: 32px; align-items: start;">
      <div class="checkout-main">
        <div class="panel">
          <h2 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:16px;">Informasi Pengiriman & Pembayaran</h2>
          
          <form id="form-checkout" class="form-vertical">
            ${user.role === 'ADMIN' ? `
              <div class="form-group">
                <label class="form-label">ID Pelanggan (Admin Mode)</label>
                <input name="customerId" type="number" class="input" required placeholder="Masukkan ID Customer" />
              </div>
            ` : `
               <input name="customerId" type="hidden" value="${user.id}" />
               <div class="form-group">
                 <label class="form-label">Pelanggan</label>
                 <div class="static-value">${user.username || user.email}</div>
               </div>
            `}

            <div class="form-group">
              <label class="form-label">Metode Pembayaran</label>
              <div class="payment-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <label class="radio-card">
                  <input type="radio" name="paymentMethod" value="CASH" checked>
                  <div class="card-content">
                    <span class="icon">💵</span> Tunai
                  </div>
                </label>
                <label class="radio-card">
                  <input type="radio" name="paymentMethod" value="TRANSFER">
                  <div class="card-content">
                    <span class="icon">💳</span> Transfer Bank
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Catatan (Opsional)</label>
              <textarea name="notes" class="input" rows="2" placeholder="Catatan tambahan untuk pesanan ini..."></textarea>
            </div>

            <button class="btn primary btn-full-width btn-lg" type="submit" style="margin-top: 24px;">
              Buat Pesanan Sekarang
            </button>
          </form>
          <div id="checkout-msg" class="msg" style="display:none; margin-top:16px;"></div>
        </div>
      </div>

      <aside class="checkout-sidebar">
        <div class="panel summary-panel">
          <h3 style="margin-top:0;">Ringkasan Pesanan</h3>
          ${items.length ? `
            <div class="checkout-items">
              ${items.map((x) => `
                <div class="checkout-item" style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px;">
                  <span>${x.name} <span class="muted">x${x.qty || 1}</span></span>
                  <span style="font-weight:600;">Rp ${(x.price * (x.qty||1)).toLocaleString('id-ID')}</span>
                </div>
              `).join('')}
            </div>
            <div class="divider" style="height:1px; background:#eee; margin:16px 0;"></div>
            <div class="total-row" style="display:flex; justify-content:space-between; font-size:18px; font-weight:700;">
              <span>Total Tagihan</span>
              <span style="color:var(--primary);">Rp ${total.toLocaleString('id-ID')}</span>
            </div>
          ` : '<p class="muted">Keranjang kosong.</p>'}
        </div>
      </aside>
    </div>
    
    <style>
      .radio-card input { display: none; }
      .radio-card .card-content {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
      }
      .radio-card input:checked + .card-content {
        border-color: var(--primary);
        background: #fff5f5;
        color: var(--primary);
        box-shadow: 0 0 0 1px var(--primary);
      }
      .static-value {
        padding: 12px;
        background: #f8fafc;
        border-radius: 8px;
        color: #333;
        font-weight: 500;
      }
    </style>
  `;

  window.__bindPage = () => {
    const form = document.getElementById('form-checkout');
    if (!form) return;
    
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const payload = Object.fromEntries(new FormData(form));
      const msg = document.getElementById('checkout-msg');
      const cart = State.getCart();
      
      if (!cart.length) {
        alert('Keranjang kosong!');
        return;
      }
      
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Memproses...';
      
      msg.style.display = 'block';
      msg.textContent = 'Sedang memproses transaksi...'; 
      msg.className = 'msg'; // Reset classes

      try {
        const customerId = Number(payload.customerId);
        
        // Sequential transaction creation
        const results = [];
        for (const item of cart) {
          const body = { 
            customerId, 
            productId: Number(item.id), 
            quantity: Number(item.qty) || 1, 
            paymentMethod: payload.paymentMethod 
            // Note: 'notes' might not be supported by backend yet, ignoring for now
          };
          const res = await API.apiPost('/api/transactions', body);
          results.push(res);
        }
        
        msg.textContent = `Berhasil! ${results.length} pesanan telah dibuat.`;
        msg.className = 'msg success';
        
        setTimeout(() => {
            State.clearCart();
            window.location.hash = '#/orders';
        }, 1500);
        
      } catch (e) {
        btn.disabled = false;
        btn.textContent = 'Buat Pesanan Sekarang';
        msg.textContent = 'Gagal: ' + e.message; 
        msg.className = 'msg error';
      }
    });
  };

  return html;
}
