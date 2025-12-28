function setMsg(el, text, isError = false) {
  el.textContent = text;
  el.classList.toggle("error", isError);
}

async function submitLogin(ev) {
  ev.preventDefault();
  const msg = document.querySelector("#login-msg");
  const payload = Object.fromEntries(new FormData(ev.currentTarget));
  try {
    const res = await API.apiPost("/api/customers/login", payload);
    setMsg(msg, res.message || "Login sukses");
  } catch (e) {
    setMsg(msg, e.message, true);
  }
}

function bind() {
  document.querySelector("#form-login").addEventListener("submit", submitLogin);
}

document.addEventListener("DOMContentLoaded", bind);