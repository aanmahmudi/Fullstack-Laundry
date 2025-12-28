function setMsg(el, text, isError = false) {
  el.textContent = text;
  el.classList.toggle("error", isError);
}

async function loadCustomers() {
  const list = document.querySelector("#customers-list");
  list.innerHTML = "Memuat...";
  try {
    const items = await API.apiGet("/api/customers");
    if (!items || items.length === 0) {
      list.innerHTML = `<li>Belum ada pelanggan.</li>`;
    } else {
      list.innerHTML = items
        .map((c) => `<li>[${c.id}] ${c.username} - ${c.email} - ${c.phoneNumber || ""}</li>`)
        .join("");
    }
  } catch (e) {
    list.innerHTML = `<li class="error">${e.message}</li>`;
  }
}

async function submitRegister(ev) {
  ev.preventDefault();
  const form = ev.currentTarget;
  const msg = document.querySelector("#register-msg");
  const payload = Object.fromEntries(new FormData(form));

  // Validasi mengikuti backend
  // - dateOfBirth wajib (yyyy-MM-dd)
  // - phoneNumber 12–13 digit angka
  // - password minimal 8 karakter
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

function bind() {
  document.querySelector("#btn-load-customers").addEventListener("click", loadCustomers);
  document.querySelector("#form-register").addEventListener("submit", submitRegister);
}
// Saat halaman dibuka, bind event dan langsung muat data dari DB
document.addEventListener("DOMContentLoaded", () => {
  bind();
  loadCustomers();
});