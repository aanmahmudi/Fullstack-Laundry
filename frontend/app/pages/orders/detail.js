export function OrderDetailPage(params) {
  const id = Number(params.id);
  // Hapus sidebar, gunakan layout single column yang bersih
  const html = `
    <section class="order-detail-page" style="max-width: 800px; margin: 0 auto; padding-bottom: 40px;">
      <div id="order-detail" class="panel" style="background: transparent; box-shadow: none; padding: 0;">
        <div style="text-align: center; padding: 40px; color: #64748b;">Memuat detail pesanan...</div>
      </div>
    </section>
  `;

  window.__bindPage = async () => {
    const box = document.getElementById('order-detail');
    if (!box) return;
    
    try {
      const t = await API.apiGet(`/api/transactions/${id}`);
      
      // Helper untuk status
      const getStatusInfo = (orderStatus, paymentStatus) => {
        if (orderStatus === 'DONE') return { text: 'Pesanan Selesai', desc: 'Pesanan telah diterima oleh pembeli.', icon: '✅', color: '#22c55e', bg: '#dcfce7' };
        if (orderStatus === 'PROCESSING') return { text: 'Sedang Dikemas', desc: 'Penjual sedang menyiapkan pesanan Anda.', icon: '📦', color: '#3b82f6', bg: '#dbeafe' };
        if (orderStatus === 'SHIPPED') return { text: 'Sedang Dikirim', desc: 'Paket sedang dalam perjalanan ke alamat tujuan.', icon: '🚚', color: '#3b82f6', bg: '#dbeafe' };
        // if (paymentStatus === 'UNPAID') return { text: 'Belum Bayar', desc: 'Silakan lakukan pembayaran agar pesanan diproses.', icon: '💳', color: '#f59e0b', bg: '#fef3c7' };
        return { text: orderStatus || 'Menunggu Konfirmasi', desc: 'Pesanan sedang diverifikasi.', icon: '⏳', color: '#64748b', bg: '#f1f5f9' };
      };
      
      const status = getStatusInfo(t.orderStatus, t.paymentStatus);
      
      // Handle Photo URL
      let photoUrl = t.productPhoto;
      if (photoUrl && photoUrl.startsWith('/')) {
         // Gunakan port 8080 sesuai log backend, atau fallback ke 8081 jika API_BASE diset lain
         const baseUrl = (window.API_BASE) || 'http://localhost:8080';
         photoUrl = baseUrl + photoUrl;
      }
      photoUrl = photoUrl || 'https://placehold.co/80x80/f1f5f9/94a3b8?text=No+Image';

      // Format currency
      const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');
      
      // Render Content
      box.innerHTML = `
        <!-- Alamat Pengiriman -->
        <div style="background: #fff; padding: 20px; border-radius: 4px; border: 1px solid #e2e8f0; margin-bottom: 12px;">
           <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="font-size: 20px; color: var(--primary);">📍</div>
              <div>
                 <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #333;">Alamat Pengiriman</h4>
                 <div style="font-size: 14px; color: #475569; line-height: 1.5;">
                    <div style="font-weight: 500; color: #333;">${t.customerName || 'Nama Penerima'}</div>
                    <div>${t.shippingAddress || 'Alamat belum diatur'}</div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Daftar Produk -->
        <div style="background: #fff; border-radius: 4px; border: 1px solid #e2e8f0; margin-bottom: 12px; overflow: hidden;">
           <div style="padding: 16px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 600; color: #333;">Remon Mall</span>
              <span style="background: var(--primary); color: white; padding: 2px 6px; border-radius: 2px; font-size: 10px;">Official</span>
           </div>
           
           <div style="padding: 16px; display: flex; gap: 16px; border-bottom: 1px solid #f1f5f9;">
              <img src="${photoUrl}" style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px;">
              <div style="flex: 1;">
                 <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 500; color: #333;">${t.productName || 'Produk'}</h4>
                 <div style="color: #64748b; font-size: 14px; margin-bottom: 4px;">Variasi: -</div>
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 14px;">x${t.quantity}</span>
                    <span style="font-weight: 500; color: #333;">${formatRupiah(t.totalPrice / (t.quantity || 1))}</span> 
                 </div>
              </div>
           </div>
        </div>

        <!-- Rincian Pembayaran -->
        <div style="background: #fff; padding: 20px; border-radius: 4px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
           <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #333;">Rincian Pembayaran</h4>
           
           <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #64748b;">
              <span>Metode Pembayaran</span>
              <span>${t.paymentMethod || 'Transfer Bank'}</span>
           </div>
           
           <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #64748b;">
              <span>Subtotal untuk Produk</span>
              <span>${formatRupiah(t.totalPrice)}</span>
           </div>
           
           <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px; color: #64748b;">
              <span>Total Ongkos Kirim</span>
              <span>Rp 0</span>
           </div>
           
           <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 1px dashed #e2e8f0; font-size: 18px; font-weight: 600; color: var(--primary);">
              <span>Total Pembayaran</span>
              <span>${formatRupiah(t.totalPrice)}</span>
           </div>
        </div>

        <!-- Info Pesanan -->
        <div style="background: #fff; padding: 16px; border-radius: 4px; border: 1px solid #e2e8f0; margin-bottom: 24px; font-size: 12px; color: #94a3b8;">
           <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>No. Pesanan</span>
              <span style="user-select: all;">${t.id}</span>
           </div>
           <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Status Pesanan</span>
              <span style="color: ${status.color === '#22c55e' ? 'green' : 'inherit'}; font-weight: 500;">${status.text}</span>
           </div>
           <div style="display: flex; justify-content: space-between;">
              <span>Waktu Pemesanan</span>
              <span>${t.transactionDate ? new Date(t.transactionDate).toLocaleString('id-ID') : '-'}</span>
           </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <a href="#/orders" class="btn outline" style="border: 1px solid #cbd5e1; color: #334155; padding: 10px 24px; text-decoration: none; border-radius: 4px;">Kembali</a>
            ${t.orderStatus === 'DONE' ? `<a href="#/products/${t.productId || ''}" class="btn primary" style="padding: 10px 24px; text-decoration: none; border-radius: 4px;">Beli Lagi</a>` : ''}
            <button class="btn outline" style="border: 1px solid #cbd5e1; color: #334155; padding: 10px 24px; cursor: pointer; border-radius: 4px;">Hubungi Penjual</button>
        </div>
      `;

    } catch (e) {
      if (box) {
        box.innerHTML = `
           <div style="text-align: center; padding: 40px;">
              <p style="color: #ef4444; margin-bottom: 16px;">Gagal memuat detail pesanan</p>
              <p style="color: #64748b; font-size: 14px;">${e.message}</p>
              <button onclick="window.location.reload()" class="btn primary" style="margin-top: 16px;">Coba Lagi</button>
           </div>
        `;
      }
    }
  };

  return html;
}
