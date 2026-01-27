import { State } from '../../core/state.js';

export function AdminOrdersPage() {
  const user = State.getUser();
  if (!user || user.role !== 'ADMIN') {
    return `<div class="panel error">Akses ditolak. Halaman ini khusus Admin.</div>`;
  }

  const html = `
    <section class="columns">
      <div class="col">
        <h2>Kelola Pesanan (Admin)</h2>
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
        list.innerHTML = '<div class="loading">Memuat data...</div>';
        const items = await API.apiGet('/api/transactions');
        
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
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Produk</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Status Pembayaran</th>
                  <th>Status Pesanan</th>
                  <th>Aksi</th>
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
        list.innerHTML = `<p class="error">${e.message}</p>`;
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
  
  const optionsHtml = statusOptions.map(opt => 
    `<option value="${opt.value}" ${opt.value === currentStatus ? 'selected' : ''}>${opt.label}</option>`
  ).join('');

  return `
    <tr>
      <td>#${t.id}</td>
      <td>${t.customerName}</td>
      <td>${t.productName}</td>
      <td>${t.quantity}</td>
      <td>Rp ${Number(t.totalAmount || t.totalPrice || 0).toLocaleString('id-ID')}</td>
      <td>
        <span class="badge ${t.paymentStatus === 'PAID' ? 'success' : 'warning'}">
          ${t.paymentStatus}
        </span>
      </td>
      <td>
        <select class="status-select" data-id="${t.id}" style="padding:4px; border-radius:4px;">
          ${optionsHtml}
        </select>
      </td>
      <td>
        <a href="#/orders/${t.id}" class="btn small">Detail</a>
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
