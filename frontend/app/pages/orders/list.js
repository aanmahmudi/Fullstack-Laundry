import { State } from '../../core/state.js';

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
            <a class="btn" href="#/login">Login / Register</a>
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
        list.innerHTML = '<p>Silakan <a href="#/login">login</a> untuk melihat pesanan.</p>';
        return;
      }
      let items = await API.apiGet('/api/transactions');
      // Tampilkan hanya pesanan milik user bila tersedia
      items = items.filter((t) => String(t.customerId) === String(user.id));
      if (!items.length) {
        list.innerHTML = '<p>Tidak ada pesanan.</p>';
        return;
      }

      const getStatusLabel = (s) => {
        if (s === 'ON_PROCESS') return 'On Process';
        if (s === 'PROCESSING') return 'Proses';
        if (s === 'DONE') return 'Selesai';
        return s || 'Menunggu';
      };

      list.innerHTML = `
        <div class="list-group">
          ${items.map((t) => `
            <div class="panel" style="margin-bottom: 12px; padding: 16px; border-left: 4px solid var(--primary);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="font-weight:bold; font-size:1.1em;">Order #${t.id}</div>
                  <div style="color:var(--text-muted); margin-bottom:8px;">${t.productName || 'Produk Remon Eccom'}</div>
                  <div>Qty: ${t.quantity} • Total: <strong>Rp ${Number(t.totalAmount || 0).toLocaleString('id-ID')}</strong></div>
                </div>
                <div style="text-align:right;">
                  <span class="badge ${t.orderStatus === 'DONE' ? 'success' : (t.orderStatus === 'PROCESSING' ? 'warning' : 'info')}">
                    ${getStatusLabel(t.orderStatus)}
                  </span>
                  <div style="margin-top:8px;">
                     <a class="btn small outline" href="#/orders/${t.id}">Detail</a>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      list.innerHTML = `<p class="error">${e.message}</p>`;
    }
  };

  return html;
}
