function setMsg(el, text, isError = false) {
  el.textContent = text;
  el.classList.toggle("error", isError);
}

async function loadTransactions() {
  const list = document.querySelector("#transactions-list");
  list.innerHTML = "Memuat...";
  try {
    const items = await API.apiGet("/api/transactions");
    if (!items || items.length === 0) {
      list.innerHTML = `<li>Belum ada transaksi.</li>`;
    } else {
      list.innerHTML = items
        .map((t) => `<li>[${t.id}] cust:${t.customerId} prod:${t.productId} qty:${t.quantity} total:${t.totalAmount ?? '-'}</li>`)
        .join("");
    }
  } catch (e) {
    list.innerHTML = `<li class="error">${e.message}</li>`;
  }
}

async function submitTransaction(ev) {
  ev.preventDefault();
  const form = ev.currentTarget;
  const msg = document.querySelector("#transaction-msg");
  const payload = Object.fromEntries(new FormData(form));
  payload.customerId = Number(payload.customerId);
  payload.productId = Number(payload.productId);
  payload.quantity = Number(payload.quantity);
  try {
    const res = await API.apiPost("/api/transactions", payload);
    setMsg(msg, `Transaksi dibuat: ID ${res.id}`);
    form.reset();
    loadTransactions();
  } catch (e) {
    setMsg(msg, e.message, true);
  }
}

async function submitPayment(ev) {
  ev.preventDefault();
  const form = ev.currentTarget;
  const msg = document.querySelector("#payment-msg");
  const payload = Object.fromEntries(new FormData(form));
  payload.transactionId = Number(payload.transactionId);
  payload.paymentAmount = Number(payload.paymentAmount);
  try {
    const res = await API.apiPost("/api/transactions/payment", payload);
    setMsg(msg, `Pembayaran sukses untuk transaksi ${res.id}`);
    form.reset();
    loadTransactions();
  } catch (e) {
    setMsg(msg, e.message, true);
  }
}

function bind() {
  document.querySelector("#btn-load-transactions").addEventListener("click", loadTransactions);
  document.querySelector("#form-transaction").addEventListener("submit", submitTransaction);
  document.querySelector("#form-payment").addEventListener("submit", submitPayment);
}
// Saat halaman dibuka, bind event dan langsung muat data dari DB
document.addEventListener("DOMContentLoaded", () => {
  bind();
  loadTransactions();
});