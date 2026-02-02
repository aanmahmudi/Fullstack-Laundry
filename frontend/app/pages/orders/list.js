import { State } from '../../core/state.js?v=remon14';

export function OrdersPage() {
  const user = State.getUser();
  const html = `
    <section>
      <h2 style="margin-bottom: 24px;">Pesanan Saya</h2>
      
      <!-- Filter Tabs -->
      <div class="tabs" style="display: flex; gap: 0; background: #fff; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; overflow-x: auto;">
        <button class="tab-btn active" style="padding: 16px 24px; border: none; background: none; font-weight: 600; color: var(--primary); border-bottom: 2px solid var(--primary); cursor: pointer;">Semua</button>
        <button class="tab-btn" style="padding: 16px 24px; border: none; background: none; color: #64748b; cursor: pointer;">Belum Bayar</button>
        <button class="tab-btn" style="padding: 16px 24px; border: none; background: none; color: #64748b; cursor: pointer;">Dikemas</button>
        <button class="tab-btn" style="padding: 16px 24px; border: none; background: none; color: #64748b; cursor: pointer;">Dikirim</button>
        <button class="tab-btn" style="padding: 16px 24px; border: none; background: none; color: #64748b; cursor: pointer;">Selesai</button>
      </div>

      <div id="orders-list">
        <div class="loading-state" style="padding: 40px; text-align: center; color: #64748b;">
            Memuat pesanan...
        </div>
      </div>
    </section>
  `;

  window.__bindPage = async () => {
    const list = document.getElementById('orders-list');
    if (!list) return;

    const user = State.getUser();
    try {
      if (!user) {
        list.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin-bottom: 16px; color: #64748b;">Silakan login untuk melihat pesanan Anda.</p>
            <a href="#/login" class="btn btn-primary">Login Sekarang</a>
          </div>
        `;
        return;
      }
      
      let items = await API.apiGet('/api/transactions');
      // Tampilkan hanya pesanan milik user
      items = items.filter((t) => String(t.customerId) === String(user.id));
      // Urutkan dari yang terbaru (asumsi ID auto increment)
      items.sort((a, b) => b.id - a.id);
      
      // Re-check element existence after async operation
      if (!document.getElementById('orders-list')) return;

      if (!items.length) {
        list.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                <h3 style="margin-bottom: 8px; color: #334155;">Belum ada pesanan</h3>
                <p style="margin-bottom: 24px; color: #64748b;">Yuk mulai belanja dan penuhi kebutuhanmu!</p>
                <a href="#/products" class="btn btn-primary">Mulai Belanja</a>
            </div>
        `;
        return;
      }

      const getStatusLabel = (orderStatus, paymentStatus, paymentMethod) => {
        if (orderStatus === 'DONE') return { text: 'Selesai', color: 'success' };
        if (orderStatus === 'PROCESSING' || orderStatus === 'DIKEMAS') return { text: 'Sedang Dikemas', color: 'info' };
        
        if (paymentMethod === 'COD') {
            return { text: 'COD - Menunggu Pembayaran', color: 'warning' };
        }
        
        if (paymentStatus === 'UNPAID') return { text: 'Belum Bayar', color: 'warning' };
        return { text: orderStatus || 'Menunggu Konfirmasi', color: 'info' };
      };

      list.innerHTML = `
        <div class="orders-container" style="display: flex; flex-direction: column; gap: 16px;">
          ${items.map((t) => {
             const status = getStatusLabel(t.orderStatus, t.paymentStatus, t.paymentMethod);
             let photoUrl = t.productPhoto;
             if (photoUrl && photoUrl.startsWith('/')) {
                 const baseUrl = (window.API && window.API.BASE_URL) || 'http://localhost:8081';
                 photoUrl = baseUrl + photoUrl;
             }
             photoUrl = photoUrl || 'https://placehold.co/80x80/f1f5f9/94a3b8?text=No+Image';
             
             return `
            <div class="order-card" style="background: #fff; border-radius: 2px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              
              <!-- Card Header -->
              <div class="card-header" style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                 <div style="font-size: 14px; color: #333; font-weight: 600;">
                    <span style="margin-right: 8px;">Remon Mall</span>
                    <span style="color: #cbd5e1;">|</span>
                    <span style="margin-left: 8px; font-weight: 400; color: #64748b;">${new Date(t.transactionDate || Date.now()).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                 </div>
                 <div style="font-size: 14px; font-weight: 600; color: var(--primary); text-transform: uppercase;">
                    ${status.text}
                 </div>
              </div>

              <!-- Card Body (Product) -->
              <a href="#/orders/${t.id}" style="text-decoration: none; color: inherit; display: block;">
                <div class="card-body" style="padding: 16px; display: flex; align-items: flex-start; gap: 16px;">
                    <img src="${photoUrl}" style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #e2e8f0; background: #f8fafc;" alt="Product">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 500; line-height: 1.4;">${t.productName || 'Produk Tanpa Nama'}</h4>
                        <p style="margin: 0; color: #64748b; font-size: 14px;">Variasi: -</p>
                        <p style="margin: 4px 0 0 0; font-size: 14px;">x${t.quantity}</p>
                    </div>
                    <div style="text-align: right;">
                        <span style="color: #94a3b8; text-decoration: line-through; font-size: 13px; margin-right: 4px;">Rp ${(Number(t.totalPrice) * 1.2).toLocaleString('id-ID')}</span>
                        <div style="color: var(--primary); font-weight: 600;">Rp ${Number(t.totalPrice || 0).toLocaleString('id-ID')}</div>
                    </div>
                </div>
              </a>

              <!-- Card Footer -->
              <div class="card-footer" style="padding: 16px; border-top: 1px solid #f1f5f9; background: #fffafb; display: flex; justify-content: space-between; align-items: center;">
                 <div style="font-size: 14px; color: #64748b;">
                    Total Pesanan: <span style="color: var(--primary); font-size: 18px; font-weight: 600;">Rp ${Number(t.totalPrice || 0).toLocaleString('id-ID')}</span>
                 </div>
                 <div style="display: flex; gap: 10px;">
                    <a href="#/orders/${t.id}" class="btn small" style="background: var(--primary); color: #fff; border: none; padding: 8px 24px; font-weight: 500;">Detail Pesanan</a>
                    ${status.text === 'Selesai' ? `<a href="#/products/${t.productId}" class="btn small outline" style="border: 1px solid var(--primary); color: var(--primary); padding: 8px 24px;">Beli Lagi</a>` : ''}
                    <button class="btn small outline" style="border: 1px solid #cbd5e1; color: #334155; padding: 8px 16px;">Hubungi Penjual</button>
                 </div>
              </div>

            </div>
          `}).join('')}
        </div>
      `;
    } catch (e) {
      if (document.getElementById('orders-list')) {
         list.innerHTML = `<div class="error" style="padding: 20px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 8px;">Terjadi kesalahan: ${e.message}</div>`;
      }
    }
  };

  return html;
}
