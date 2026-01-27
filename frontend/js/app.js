const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function setMsg(el, text, isError = false) {
  el.textContent = text;
  el.classList.toggle("error", isError);
}

// PRODUCTS
async function loadProducts() {
  const list = $("#products-list");
  list.innerHTML = "Memuat...";
  try {
    const items = await API.apiGet("/api/products");
    list.innerHTML = items
      .map((p) => `<li>[${p.id}] ${p.name} - Rp ${Number(p.price).toLocaleString('id-ID')} ${p.description ? "- " + p.description : ""}</li>`)
      .join("");
  } catch (e) {
    list.innerHTML = `<li class="error">${e.message}</li>`;
  }
}

async function submitProduct(ev) {
  ev.preventDefault();
  const form = ev.currentTarget;
  const msg = $("#product-msg");
  const payload = Object.fromEntries(new FormData(form));
  // Convert price to number
  if (payload.price) payload.price = Number(payload.price);
  try {
    const created = await API.apiPost("/api/products", payload);
    setMsg(msg, `Produk dibuat: ${created.name} (#${created.id})`);
    form.reset();
    loadProducts();
  } catch (e) {
    setMsg(msg, e.message, true);
  }
}

// CUSTOMERS
async function loadCustomers() {
  const list = $("#customers-list");
  list.innerHTML = "Memuat...";
  try {
    const items = await API.apiGet("/api/customers");
    list.innerHTML = items
      .map((c) => `<li>[${c.id}] ${c.username} - ${c.email} - ${c.phoneNumber || ""}</li>`)
      .join("");
  } catch (e) {
    list.innerHTML = `<li class="error">${e.message}</li>`;
  }
}

async function submitRegister(ev) {
  ev.preventDefault();
  const form = ev.currentTarget;
  const msg = $("#register-msg");
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd);
  // dateOfBirth: yyyy-MM-dd sudah sesuai dari input type=date
  // Validasi mengikuti backend
  if (!payload.dateOfBirth) {
    return setMsg(msg, "Tanggal lahir wajib diisi", true);
  }
  if (!/^[0-9]{12,13}$/.test(payload.phoneNumber || "")) {
    return setMsg(msg, "No. HP harus 12–13 digit angka", true);
  }
  if ((payload.password || "").length < 8) {
    return setMsg(msg, "Password minimal 8 karakter", true);
  }
  try {
    const res = await API.apiPost("/api/customers/register", payload);
    setMsg(msg, `Registrasi sukses. customerId: ${res.customerId ?? "-"}`);
    form.reset();
    loadCustomers();
  } catch (e) {
    setMsg(msg, e.message, true);
  }
}

// TRANSACTIONS
async function loadTransactions() {
  const list = $("#transactions-list");
  list.innerHTML = "Memuat...";
  try {
    const items = await API.apiGet("/api/transactions");
    list.innerHTML = items
      .map((t) => `<li>[${t.id}] cust:${t.customerId} prod:${t.productId} qty:${t.quantity} total:${t.totalAmount ? 'Rp ' + Number(t.totalAmount).toLocaleString('id-ID') : '-'}</li>`)
      .join("");
  } catch (e) {
    list.innerHTML = `<li class="error">${e.message}</li>`;
  }
}

async function submitTransaction(ev) {
  ev.preventDefault();
  const form = ev.currentTarget;
  const msg = $("#transaction-msg");
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
  const msg = $("#payment-msg");
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

// AUTH
async function submitLogin(ev) {
  ev.preventDefault();
  const msg = $("#login-msg");
  const payload = Object.fromEntries(new FormData(ev.currentTarget));
  try {
    const res = await API.apiPost("/api/customers/login", payload);
    setMsg(msg, res.message || "Login sukses");
  } catch (e) {
    setMsg(msg, e.message, true);
  }
}

function bindEvents() {
  $("#btn-load-products").addEventListener("click", loadProducts);
  $("#form-product").addEventListener("submit", submitProduct);

  $("#btn-load-customers").addEventListener("click", loadCustomers);
  $("#form-register").addEventListener("submit", submitRegister);

  $("#btn-load-transactions").addEventListener("click", loadTransactions);
  $("#form-transaction").addEventListener("submit", submitTransaction);
  $("#form-payment").addEventListener("submit", submitPayment);

  $("#form-login").addEventListener("submit", submitLogin);
}

document.addEventListener("DOMContentLoaded", bindEvents);