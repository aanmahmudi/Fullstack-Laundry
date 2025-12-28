import { State } from '../core/state.js';

export function OrdersPage() {
  const user = State.getUser();
  const html = `
    <section class="columns">
      <div class="col">
        <h2>Pesanan Saya</h2>
        <div id="orders-list" class="panel">Memuat pesanan...</div>
        <div class="actions">
          <a class="btn" href="#/products">Belanja lagi</a>
        </div>
      </div>
      <aside class="col sidebar">
        <div class="panel">
          <h3>Akun</h3>
          ${user ? `<p>Masuk sebagai <strong>${user.email || 'customer'}</strong></p>` : `
            <p class="muted">Anda belum login.</p>
            <a class="btn" href="#/auth">Login / Register</a>
          `}
        </div>
      </aside>
    </section>
  `;

  window.__bindPage = async () => {
    const list = document.getElementById('orders-list');
    const user = State.getUser();
    try {
      if (!user) {
        list.innerHTML = '<p>Silakan <a href="#/auth">login</a> untuk melihat pesanan.</p>';
        return;
      }
      let items = await API.apiGet('/api/transactions');
      // Tampilkan hanya pesanan milik user bila tersedia
      items = items.filter((t) => String(t.customerId) === String(user.id));
      if (!items.length) {
        list.innerHTML = '<p>Tidak ada pesanan.</p>';
        return;
      }
      list.innerHTML = `
        <ul class="list">
          ${items.map((t) => `<li>[${t.id}] cust:${t.customerId} prod:${t.productId} qty:${t.quantity} total:${t.totalAmount || '-'} status:${t.status || '-'}  
          <a class="btn small" href="#/orders/${t.id}">Detail</a></li>`).join('')}
        </ul>
      `;
    } catch (e) {
      list.innerHTML = `<p class="error">${e.message}</p>`;
    }
  };

  return html;
}