function setMsg(el, text, isError = false) {
  el.textContent = text;
  el.classList.toggle("error", isError);
}

async function loadProducts() {
  const list = document.querySelector("#products-list");
  list.innerHTML = "Memuat...";
  try {
    const items = await API.apiGet("/api/products");
    if (!items || items.length === 0) {
      list.innerHTML = `<li>Belum ada produk.</li>`;
    } else {
      list.innerHTML = items
        .map((p) => `<li>[${p.id}] ${p.name} - Rp ${p.price} ${p.description ? "- " + p.description : ""}</li>`)
        .join("");
    }
  } catch (e) {
    list.innerHTML = `<li class="error">${e.message}</li>`;
  }
}

async function submitProduct(ev) {
  ev.preventDefault();
  const form = ev.currentTarget;
  const msg = document.querySelector("#product-msg");
  const payload = Object.fromEntries(new FormData(form));
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

function bind() {
  document.querySelector("#btn-load-products").addEventListener("click", loadProducts);
  document.querySelector("#form-product").addEventListener("submit", submitProduct);
}
// Saat halaman dibuka, bind event dan langsung muat data dari DB
document.addEventListener("DOMContentLoaded", () => {
  bind();
  loadProducts();
});