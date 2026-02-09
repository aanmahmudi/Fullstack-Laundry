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
      
      // DEBUG LOGGING
      console.log('=== DEBUG ORDER DETAIL ===');
      console.log('Transaction Data:', t);
      console.log('PaymentStatus:', t.paymentStatus, 'Expected: UNPAID');
      console.log('PaymentMethod:', t.paymentMethod, 'Expected: !COD');
      console.log('PaymentCode:', t.paymentCode, 'Expected: Truthy');
      console.log('Is UNPAID?', t.paymentStatus === 'UNPAID');
      console.log('Is not COD?', (t.paymentMethod || '').toUpperCase() !== 'COD');
      console.log('Has Code?', !!t.paymentCode);
      console.log('Condition Result:', t.paymentStatus === 'UNPAID' && (t.paymentMethod || '').toUpperCase() !== 'COD' && t.paymentCode);
      console.log('==========================');

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
         const baseUrl = (window.API && window.API.BASE_URL) || 'http://localhost:8080';
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
              <img src="${photoUrl}" onerror="this.onerror=null;this.src='https://placehold.co/80x80/f1f5f9/94a3b8?text=Error';" style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px;">
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

           <!-- DEBUG INFO DISPLAY (TEMPORARY) -->
           <div style="display:none; padding:10px; background:#eee; font-size:10px; margin:5px 0;">
             Debug: Status=${t.paymentStatus}, OrderStatus=${t.orderStatus}, Code=${t.paymentCode}
           </div>

           ${t.paymentCode ? `
           <div style="margin-top: 12px; padding: 16px; border: 1px dashed #e2e8f0; border-radius: 6px; background: #f8fafc;">
              <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom:8px;">
                 <div style="font-weight:600; color:#334155;">Kode Pembayaran (VA Test)</div>
                 <button id="copyVaBtn" style="background:#eef2ff; color:#3730a3; border:1px solid #c7d2fe; padding:6px 10px; border-radius:4px; cursor:pointer;">Salin</button>
              </div>
              <div style="font-family: monospace; font-size: 18px; letter-spacing: 1px; color:#0f172a; user-select: all;">${t.paymentCode}</div>
              <div style="margin-top:8px; font-size:12px; color:#64748b;">Gunakan kode ini untuk simulasi pembayaran. Ini hanya untuk keperluan test.</div>
              <div style="margin-top:12px;">
                 <button id="simulatePayBtn" style="background:#22c55e; color:#fff; border:none; padding:8px 12px; border-radius:4px; cursor:pointer;">Bayar (Simulasi)</button>
              </div>
           </div>
           ` : ''}
           
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
           
           <!-- NEW LOCATION FOR VA CODE (As Requested) -->
           ${t.paymentCode ? `
           <div style="background: #eff6ff; border: 1px dashed #3b82f6; padding: 12px; margin-bottom: 12px; border-radius: 4px;">
              <div style="color: #1e40af; font-weight: bold; font-size: 14px; margin-bottom: 4px;">Kode Pembayaran (Virtual Account)</div>
              <div style="font-family: monospace; font-size: 20px; color: #1e3a8a; font-weight: 700; letter-spacing: 2px;">${t.paymentCode}</div>
              <div style="font-size: 11px; color: #60a5fa; margin-top: 4px;">*Silakan transfer ke nomor VA di atas</div>
           </div>
           ` : ''}

           <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>No. Pesanan</span>
              <span style="user-select: all;">${t.orderNumber || t.id}</span>
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
      
      try {
        const copyBtn = document.getElementById('copyVaBtn');
        const simulateBtn = document.getElementById('simulatePayBtn');
        if (copyBtn) {
          copyBtn.addEventListener('click', async () => {
            try { await navigator.clipboard.writeText(t.paymentCode || ''); } catch {}
          });
        }
        if (simulateBtn) {
          simulateBtn.addEventListener('click', async () => {
            try {
              // Fix: Gunakan endpoint pay-by-code yang benar
              await API.apiPost(`/api/transactions/pay-by-code?transactionId=${t.id}&paymentCode=${encodeURIComponent(t.paymentCode)}`, {});
              alert('Pembayaran berhasil disimulasikan!');
              window.location.reload();
            } catch (e) {
              alert(e.message || 'Gagal simulasi pembayaran');
            }
          });
        }
      } catch {}

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
