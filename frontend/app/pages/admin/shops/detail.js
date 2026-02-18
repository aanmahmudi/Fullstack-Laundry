import { State } from '../../../core/state.js';

export function ShopDetailPage(params) {
  const shopId = params.id;
  const user = State.getUser();
  if (!user || user.role !== 'ADMIN') {
    setTimeout(() => { window.location.href = '/'; }, 0);
    return '';
  }

  const html = `
  <div class="hero-section" style="height: 200px; margin-bottom: 20px;">
    <div class="hero-content">
      <h1 id="shop-name-title">Loading...</h1>
      <p id="shop-desc">Memuat detail toko...</p>
    </div>
  </div>

  <section class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
      <div class="actions" style="margin-bottom: 20px; display: flex; justify-content: space-between;">
        <a href="/admin/shops" class="btn btn-text">← Kembali ke Daftar Toko</a>
        <a href="/products/add?shopId=${shopId}" class="btn primary">＋ Tambah Produk di Toko Ini</a>
      </div>
      
      <h3>Produk di Toko Ini</h3>
      <div id="shop-products-grid" class="grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
        <div class="loading">Memuat produk...</div>
      </div>
  </section>`;

  window.__bindPage = async () => {
    try {
      // 1. Get Shop Detail
      const shop = await API.apiGet(`/api/shops/${shopId}`);
      if (shop) {
        document.getElementById('shop-name-title').textContent = shop.name;
        document.getElementById('shop-desc').textContent = shop.description || 'Tidak ada deskripsi';
      }

      // 2. Get Products in this Shop
      const products = await API.apiGet(`/api/products?shopId=${shopId}`);
      const grid = document.getElementById('shop-products-grid');
      
      if (products.length === 0) {
        grid.innerHTML = `
          <div class="panel" style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <p>Belum ada produk di toko ini.</p>
            <a href="/products/add?shopId=${shopId}" class="btn primary" style="margin-top: 10px;">Tambah Produk Sekarang</a>
          </div>
        `;
        return;
      }

      grid.innerHTML = products.map(p => {
        let photoUrl = p.photoUrl;
        if (photoUrl && photoUrl.startsWith('/')) {
            const baseUrl = (window.API && window.API.BASE_URL) || 'http://localhost:8081';
            photoUrl = baseUrl + photoUrl;
        }
        return `
        <div class="product-card">
            <div class="image-container">
              <img src="${photoUrl || 'https://via.placeholder.com/300?text=No+Image'}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=No+Image';" />
            </div>
            <div class="product-info">
              <h3 class="product-name">${p.name}</h3>
              <p class="product-price">Rp ${parseInt(p.price).toLocaleString('id-ID')}</p>
              <div class="product-actions" style="margin-top: 10px;">
                 <button class="btn btn-sm btn-delete-product" data-id="${p.id}" style="width: 100%; background: #ff4d4f; color: white;">Hapus</button>
              </div>
            </div>
        </div>
      `;
      }).join('');

      // Bind delete buttons
      grid.querySelectorAll('.btn-delete-product').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Yakin hapus produk ini?')) {
            try {
              await API.apiDelete(`/api/products/${btn.dataset.id}?requesterId=${user.id}`);
              btn.closest('.product-card').remove();
            } catch (err) {
              alert('Gagal hapus: ' + err.message);
            }
          }
        });
      });

    } catch (err) {
      console.error(err);
      Swal.fire('Error', `Gagal memuat detail toko (ID: ${shopId}): ${err.message}`, 'error');
    }
  };

  return html;
}
