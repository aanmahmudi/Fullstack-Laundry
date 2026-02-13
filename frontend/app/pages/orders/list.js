import { State } from '../../core/state.js?v=remon14';

export function OrdersPage() {
  const user = State.getUser();
  const html = `
    <section>
      <h2 style="margin-bottom: 24px;">Pesanan Saya</h2>
      
      <!-- Filter Tabs -->
      <div class="tabs" id="order-tabs" style="display: flex; gap: 0; background: #fff; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; overflow-x: auto;">
        <button class="tab-btn active" data-tab="all" style="padding: 16px 24px; border: none; background: none; font-weight: 600; color: var(--primary); border-bottom: 2px solid var(--primary); cursor: pointer; white-space: nowrap;">Semua</button>
        <button class="tab-btn" data-tab="unpaid" style="padding: 16px 24px; border: none; background: none; color: #64748b; cursor: pointer; white-space: nowrap;">Belum Bayar</button>
        <button class="tab-btn" data-tab="packed" style="padding: 16px 24px; border: none; background: none; color: #64748b; cursor: pointer; white-space: nowrap;">Dikemas</button>
        <button class="tab-btn" data-tab="shipping" style="padding: 16px 24px; border: none; background: none; color: #64748b; cursor: pointer; white-space: nowrap;">Dikirim</button>
        <button class="tab-btn" data-tab="completed" style="padding: 16px 24px; border: none; background: none; color: #64748b; cursor: pointer; white-space: nowrap;">Selesai</button>
      </div>

      <div id="orders-list">
        <div class="loading-state" style="padding: 40px; text-align: center; color: #64748b;">
            Memuat pesanan...
        </div>
      </div>
    </section>
  `;

  window.__bindPage = async () => {
    const listContainer = document.getElementById('orders-list');
    const tabsContainer = document.getElementById('order-tabs');
    if (!listContainer) return;

    const user = State.getUser();
    
    if (!user) {
        listContainer.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin-bottom: 16px; color: #64748b;">Silakan login untuk melihat pesanan Anda.</p>
            <a href="#/login" class="btn btn-primary">Login Sekarang</a>
          </div>
        `;
        return;
    }

    let allOrders = [];
    let activeTab = 'all';

    try {
        let items = await API.apiGet('/api/transactions');
        // Tampilkan hanya pesanan milik user
        allOrders = items.filter((t) => String(t.customerId) === String(user.id));
        // Urutkan dari yang terbaru (asumsi ID auto increment)
        allOrders.sort((a, b) => b.id - a.id);
        
        renderOrders();

        // Bind Tab Clicks
        if (tabsContainer) {
            const tabs = tabsContainer.querySelectorAll('.tab-btn');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Update Active State
                    tabs.forEach(t => {
                        t.classList.remove('active');
                        t.style.color = '#64748b';
                        t.style.borderBottom = 'none';
                        t.style.fontWeight = '400';
                    });
                    tab.classList.add('active');
                    tab.style.color = 'var(--primary)';
                    tab.style.borderBottom = '2px solid var(--primary)';
                    tab.style.fontWeight = '600';

                    // Update Filter
                    activeTab = tab.dataset.tab;
                    renderOrders();
                });
            });
        }

    } catch (e) {
        if (listContainer) {
             listContainer.innerHTML = `<div class="error" style="padding: 20px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 8px;">Terjadi kesalahan: ${e.message}</div>`;
        }
    }

    function getStatusLabel(orderStatus) {
        const status = (orderStatus || '').toUpperCase();
        
        if (status === 'SELESAI' || status === 'DONE' || status === 'COMPLETED') {
            return { text: 'Selesai', color: 'success' };
        }
        if (status === 'DIKIRIM' || status === 'SHIPPING' || status === 'ON_DELIVERY') {
            return { text: 'Sedang Dikirim', color: 'info' };
        }
        if (status === 'DIKEMAS' || status === 'PROCESSING' || status === 'PAID') {
            return { text: 'Sedang Dikemas', color: 'info' };
        }
        if (status === 'BELUM_BAYAR' || status === 'MENUNGGU PEMBAYARAN' || status === 'UNPAID') {
            return { text: 'Belum Bayar', color: 'warning' };
        }
        
        return { text: orderStatus || 'Menunggu Konfirmasi', color: 'info' };
    }

    function renderOrders() {
        if (!listContainer) return;
        
        let filteredOrders = allOrders;
        
        if (activeTab === 'unpaid') {
            filteredOrders = allOrders.filter(t => {
                const status = (t.orderStatus || '').toUpperCase();
                return status === 'BELUM_BAYAR' || status === 'MENUNGGU PEMBAYARAN' || status === 'UNPAID';
            });
        } else if (activeTab === 'packed') {
             filteredOrders = allOrders.filter(t => {
                const status = (t.orderStatus || '').toUpperCase();
                return status === 'DIKEMAS' || status === 'PROCESSING' || status === 'PAID';
            });
        } else if (activeTab === 'shipping') {
             filteredOrders = allOrders.filter(t => {
                const status = (t.orderStatus || '').toUpperCase();
                return status === 'DIKIRIM' || status === 'SHIPPING' || status === 'ON_DELIVERY';
            });
        } else if (activeTab === 'completed') {
             filteredOrders = allOrders.filter(t => {
                const status = (t.orderStatus || '').toUpperCase();
                return status === 'SELESAI' || status === 'DONE' || status === 'COMPLETED';
            });
        }

        if (!filteredOrders.length) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                    <h3 style="margin-bottom: 8px; color: #334155;">Tidak ada pesanan</h3>
                    <p style="margin-bottom: 24px; color: #64748b;">Di status ini belum ada pesanan.</p>
                    ${activeTab === 'all' ? '<a href="#/products" class="btn btn-primary">Mulai Belanja</a>' : ''}
                </div>
            `;
            return;
        }

        listContainer.innerHTML = `
        <div class="orders-container" style="display: flex; flex-direction: column; gap: 16px;">
          ${filteredOrders.map((t) => {
             const status = getStatusLabel(t.orderStatus);
             let photoUrl = t.productPhoto;
             if (photoUrl && photoUrl.startsWith('/')) {
                 const baseUrl = (window.API && window.API.BASE_URL) || 'http://localhost:8080';
                 photoUrl = baseUrl + photoUrl;
             }
             const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";
             photoUrl = photoUrl || placeholder;
             
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
                    <img src="${photoUrl}" onerror="this.onerror=null;this.src='${placeholder.replace(/'/g, "%27")}';" style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #e2e8f0; background: #f8fafc;" alt="Product">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 500; line-height: 1.4;">${t.productName || 'Produk Tanpa Nama'}</h4>
                        <p style="margin: 0; color: #64748b; font-size: 14px;">Variasi: -</p>
                        <p style="margin: 4px 0 0 0; font-size: 14px;">x${t.quantity}</p>
                    </div>
                    <div style="text-align: right;">
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
                    ${(() => {
                        if (t.sellerPhone) {
                            const phoneNumber = t.sellerPhone.replace(/^0/, '62').replace(/\D/g, '');
                            const message = `Halo, saya ingin menanyakan tentang pesanan ini:\n\nNo. Pesanan: ${t.orderNumber || t.id}\nProduk: ${t.productName}\nJumlah: ${t.quantity}\nTotal: Rp ${Number(t.totalPrice).toLocaleString('id-ID')}\nStatus: ${t.orderStatus}`;
                            const encodedMessage = encodeURIComponent(message);
                            return `<a href="https://wa.me/${phoneNumber}?text=${encodedMessage}" target="_blank" class="btn small outline" style="border: 1px solid #cbd5e1; color: #334155; padding: 8px 16px; text-decoration: none;">Hubungi Penjual</a>`;
                        } else {
                            return `<button class="btn small outline" style="border: 1px solid #cbd5e1; color: #334155; padding: 8px 16px; cursor: pointer;" onclick="alert('Maaf, nomor penjual belum tersedia saat ini.')">Hubungi Penjual</button>`;
                        }
                    })()}
                 </div>
              </div>

            </div>
          `}).join('')}
        </div>
      `;
    }
  };

  return html;
}
