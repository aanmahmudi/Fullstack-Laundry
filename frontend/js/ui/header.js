function renderHeader() {
  const el = document.getElementById("app-header");
  if (!el) return;
  el.innerHTML = `
    <div class="header-wrap">
      <h1>Remon Eccom</h1>
      <nav></nav>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", renderHeader);
