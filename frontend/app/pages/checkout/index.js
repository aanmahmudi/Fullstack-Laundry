import { State } from '../../core/state.js';

export function CheckoutPage() {
  const items = State.getCart();
  const total = items.reduce((sum, x) => sum + (x.price * (x.qty || 1)), 0);
  const html = `
    <section class="columns">
      <div class="col">
        <h2>Checkout</h2>
        <form id="form-checkout" class="form">
          <label>Customer ID <input name="customerId" required type="number" placeholder="Masukkan ID customer"/></label>
          <label>Payment Method 
            <select name="paymentMethod" required>
              <option value="CASH">CASH</option>
              <option value="TRANSFER">TRANSFER</option>
            </select>
          </label>
          <button class="btn primary" type="submit">Buat Transaksi</button>
        </form>
        <p id="checkout-msg"></p>
      </div>
      <aside class="col sidebar">
        <div class="panel">
          ${items.length ? `
            <ul class="list">
              ${items.map((x) => `<li>${x.name} x${x.qty || 1} — Rp ${x.price}</li>`).join('')}
            </ul>
            <p><strong>Total pembayaran:</strong> Rp ${total}</p>
          ` : '<p class="muted">Keranjang kosong.</p>'}
        </div>
      </aside>
    </section>
  `;

  window.__bindPage = () => {
    const form = document.getElementById('form-checkout');
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const payload = Object.fromEntries(new FormData(form));
      const msg = document.getElementById('checkout-msg');
      const cart = State.getCart();
      if (!cart.length) return;
      msg.textContent = 'Mengirim transaksi...'; msg.classList.remove('error');
      try {
        const customerId = Number(payload.customerId);
        // Kirim satu transaksi per item keranjang (sederhana, mengikuti API tersedia)
        const results = [];
        for (const item of cart) {
          const body = { customerId, productId: Number(item.id), quantity: Number(item.qty) || 1, paymentMethod: payload.paymentMethod };
          const res = await API.apiPost('/api/transactions', body);
          results.push(res);
        }
        msg.textContent = `Berhasil membuat ${results.length} transaksi.`;
        State.clearCart();
        window.location.hash = '#/orders';
      } catch (e) {
        msg.textContent = e.message; msg.classList.add('error');
      }
    });
  };

  return html;
}
