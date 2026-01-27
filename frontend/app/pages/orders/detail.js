export function OrderDetailPage(params) {
  const id = Number(params.id);
  const html = `
    <section class="columns">
      <div class="col">
        <h2>Detail Pesanan #${id}</h2>
        <div id="order-detail" class="panel">Memuat...</div>
        <div class="actions">
          <a class="btn" href="#/orders">Kembali ke Pesanan</a>
        </div>
      </div>
      <aside class="col sidebar">
        <div class="panel">
          <h3>Pembayaran</h3>
          <form id="form-payment" class="form">
            <label>Nominal <input name="paymentAmount" type="number" required placeholder="Masukkan jumlah bayar"/></label>
            <button class="btn primary" type="submit">Bayar</button>
          </form>
          <p id="payment-msg"></p>
        </div>
      </aside>
    </section>
  `;

  window.__bindPage = async () => {
    const box = document.getElementById('order-detail');
    try {
      const t = await API.apiGet(`/api/transactions/${id}`);
      box.innerHTML = `
        <p><strong>ID:</strong> ${t.id}</p>
        <p><strong>Customer:</strong> ${t.customerId}</p>
        <p><strong>Produk:</strong> ${t.productId}</p>
        <p><strong>Qty:</strong> ${t.quantity}</p>
        <p><strong>Total:</strong> ${t.totalAmount != null ? 'Rp ' + Number(t.totalAmount).toLocaleString('id-ID') : '-'}</p>
        <p><strong>Status:</strong> ${t.status ?? '-'}</p>
      `;
    } catch (e) {
      box.innerHTML = `<p class="error">${e.message}</p>`;
    }

    const form = document.getElementById('form-payment');
    const msg = document.getElementById('payment-msg');
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const payload = Object.fromEntries(new FormData(form));
      payload.transactionId = id;
      payload.paymentAmount = Number(payload.paymentAmount);
      msg.textContent = 'Memproses pembayaran...'; msg.classList.remove('error');
      try {
        const res = await API.apiPost('/api/transactions/payment', payload);
        msg.textContent = `Pembayaran sukses untuk transaksi #${res.id || id}`;
        // refresh detail
        const t = await API.apiGet(`/api/transactions/${id}`);
        box.innerHTML = `
          <p><strong>ID:</strong> ${t.id}</p>
          <p><strong>Customer:</strong> ${t.customerId}</p>
          <p><strong>Produk:</strong> ${t.productId}</p>
          <p><strong>Qty:</strong> ${t.quantity}</p>
          <p><strong>Total:</strong> ${t.totalAmount != null ? 'Rp ' + Number(t.totalAmount).toLocaleString('id-ID') : '-'}</p>
          <p><strong>Status:</strong> ${t.status ?? '-'}</p>
        `;
      } catch (e) {
        msg.textContent = e.message; msg.classList.add('error');
      }
    });
  };

  return html;
}
