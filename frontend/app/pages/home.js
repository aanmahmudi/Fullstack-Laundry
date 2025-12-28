export function HomePage() {
  window.__bindPage = null;
  return `
    <section class="hero">
      <h1>Selamat datang di Laundry App</h1>
      <p>Belanja paket laundry dengan mudah dan cepat.</p>
      <div class="actions">
        <a class="btn" href="#/products">Lihat Produk</a>
        <a class="btn ghost" href="#/orders">Pesanan Saya</a>
      </div>
    </section>
  `;
}