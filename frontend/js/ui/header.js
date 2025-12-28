const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/pages/products.html", label: "Produk" },
  { href: "/pages/customers.html", label: "Customer" },
  { href: "/pages/transactions.html", label: "Transaksi" },
  { href: "/pages/auth.html", label: "Auth" },
];

function renderHeader() {
  const el = document.getElementById("app-header");
  if (!el) return;
  const current = location.pathname.replace(/\\/g, "/");
  el.innerHTML = `
    <div class="header-wrap">
      <h1>Laundry App</h1>
      <nav>
        ${navLinks
          .map(
            (l) => `<a href="${l.href}" ${current.endsWith(l.href) ? 'aria-current="page"' : ""}>${l.label}</a>`
          )
          .join("")}
      </nav>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", renderHeader);