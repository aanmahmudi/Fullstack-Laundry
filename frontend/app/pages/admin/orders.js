import { State } from '../../core/state.js';

export function AdminOrdersPage() {
  const user = State.getUser();
  if (!user || user.role !== 'ADMIN') {
    return `<div class="panel error">Akses ditolak. Halaman ini khusus Admin.</div>`;
  }

  const html = `
    <section class="columns">
      <div class="col">
        <h2>Pesanan Masuk (Toko)</h2>
        <div class="actions">
           <button id="refresh-orders" class="btn">Refresh</button>
        </div>
        <div id="admin-orders-list" class="panel">Memuat pesanan...</div>
      </div>
    </section>
  `;

  window.__bindPage = async () => {
    const list = document.getElementById('admin-orders-list');
    const refreshBtn = document.getElementById('refresh-orders');
    
    const loadOrders = async () => {
      try {
        if (list) list.innerHTML = '<div class="loading">Memuat data...</div>';
        const items = await API.apiGet('/api/transactions');
        
        if (!document.getElementById('admin-orders-list')) return;

        if (!items.length) {
          list.innerHTML = '<p>Belum ada transaksi.</p>';
          return;
        }
        
        // Sort by date desc
        items.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

        list.innerHTML = `
          <div class="table-responsive">
            <table class="table" style="width:100%">
              <thead>
                <tr>
                  <th style="text-align:center;">ID</th>
                  <th style="text-align:center;">Customer</th>
                  <th style="text-align:center;">Produk</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:center;">Total</th>
                  <th style="text-align:center;">Metode Pembayaran</th>
                  <th style="text-align:center;">Status Pembayaran</th>
                  <th style="text-align:center;">Status Pesanan</th>
                  <th style="text-align:center;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(t => renderRow(t)).join('')}
              </tbody>
            </table>
          </div>
        `;
        
        bindStatusChange();
      } catch (e) {
        if (document.getElementById('admin-orders-list')) {
           list.innerHTML = `<p class="error">${e.message}</p>`;
        }
      }
    };

    if (refreshBtn) {
      refreshBtn.addEventListener('click', loadOrders);
    }
    
    loadOrders();
  };

  return html;
}

function renderRow(t) {
  const statusOptions = [
    { value: 'ON_PROCESS', label: 'On Process' },
    { value: 'PROCESSING', label: 'Proses' },
    { value: 'DONE', label: 'Selesai' }
  ];

  const currentStatus = t.orderStatus || 'ON_PROCESS';
  const paymentStatusRaw = (t.paymentStatus || '').toUpperCase();
  const paymentMethodRaw = (t.paymentMethod || '').toUpperCase();
  let paymentLabel = 'Belum Bayar';
  let paymentBg = '#fffbeb';
  let paymentColor = '#f97316';

  if (paymentStatusRaw === 'PAID') {
    paymentLabel = 'Lunas';
    paymentBg = '#dcfce7';
    paymentColor = '#16a34a';
  } else if (!paymentStatusRaw) {
    paymentLabel = 'Tidak diketahui';
    paymentBg = '#e5e7eb';
    paymentColor = '#4b5563';
  }

  let methodLabel = 'COD';
  let methodBg = '#e0f2fe';
  let methodColor = '#0369a1';

  if (paymentMethodRaw === 'TRANSFER') {
    methodLabel = 'Transfer Bank';
    methodBg = '#eef2ff';
    methodColor = '#4f46e5';
  } else if (paymentMethodRaw === 'CC') {
    methodLabel = 'Kartu Kredit';
    methodBg = '#f5f3ff';
    methodColor = '#7c3aed';
  } else if (!paymentMethodRaw) {
    methodLabel = 'Tidak diketahui';
    methodBg = '#e5e7eb';
    methodColor = '#4b5563';
  }
  
  const optionsHtml = statusOptions.map(opt => 
    `<option value="${opt.value}" ${opt.value === currentStatus ? 'selected' : ''}>${opt.label}</option>`
  ).join('');

  return `
    <tr>
      <td style="text-align:center;">#${t.id}</td>
      <td style="text-align:center;">${t.customerName}</td>
      <td style="text-align:center;">${t.productName}</td>
      <td style="text-align:center;">${t.quantity}</td>
      <td style="text-align:center;">Rp ${Number(t.totalAmount || t.totalPrice || 0).toLocaleString('id-ID')}</td>
      <td style="text-align:center;">
        <span style="
          display:inline-block;
          padding:4px 10px;
          border-radius:999px;
          font-size:12px;
          font-weight:600;
          background:${methodBg};
          color:${methodColor};
          min-width:130px;
          text-align:center;
        ">
          ${methodLabel}
        </span>
      </td>
      <td style="text-align:center;">
        <span style="
          display:inline-block;
          padding:4px 10px;
          border-radius:999px;
          font-size:12px;
          font-weight:600;
          background:${paymentBg};
          color:${paymentColor};
          min-width:110px;
          text-align:center;
        ">
          ${paymentLabel}
        </span>
      </td>
      <td style="text-align:center;">
        <select class="status-select" data-id="${t.id}" style="padding:4px; border-radius:4px;">
          ${optionsHtml}
        </select>
      </td>
      <td style="text-align:center;">
        <a href="/orders/${t.id}" class="btn small">Detail</a>
      </td>
    </tr>
  `;
}

function bindStatusChange() {
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const newStatus = e.target.value;
      
      try {
        e.target.disabled = true;
        await API.apiPut(`/api/transactions/${id}/status?status=${newStatus}`);
        // Optional: show toast/notification
      } catch (err) {
        alert('Gagal update status: ' + err.message);
        // Revert?
      } finally {
        e.target.disabled = false;
      }
    });
  });
}
