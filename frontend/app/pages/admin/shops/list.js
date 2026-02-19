import { State } from '../../../core/state.js';

export function ShopListPage() {
  const user = State.getUser();
  if (!user || user.role !== 'ADMIN') {
    setTimeout(() => { window.location.href = '/'; }, 0);
    return '';
  }

  const html = `
  <div class="hero-section" style="height: 200px; margin-bottom: 20px;">
    <div class="hero-content">
      <h1>Kelola Toko</h1>
      <p>Daftar toko yang Anda miliki</p>
    </div>
  </div>

  <section class="container" style="max-width: 1000px; margin: 0 auto; padding: 20px;">
      <div class="actions" style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
        <a href="/admin/shops/add" class="btn primary">＋ Buat Toko Baru</a>
      </div>
      
      <div id="shop-list-container" class="grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        <div class="loading">Memuat daftar toko...</div>
      </div>
  </section>`;

  window.__bindPage = async () => {
    const container = document.getElementById('shop-list-container');
    if (!container) return;

    try {
      const shops = await API.apiGet(`/api/shops?ownerId=${user.id}`);
      
      if (shops.length === 0) {
        container.innerHTML = `
          <div class="panel" style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <h3>Belum ada toko</h3>
            <p>Anda belum memiliki toko. Silakan buat toko baru untuk mulai berjualan.</p>
            <a href="/admin/shops/add" class="btn primary" style="margin-top: 10px;">Buat Toko Sekarang</a>
          </div>
        `;
        return;
      }

      container.innerHTML = shops.map(shop => `
        <div class="card shop-card" style="display: flex; flex-direction: column; border: 1px solid #eee; border-radius: 8px; overflow: hidden; transition: transform 0.2s;">
            <div class="shop-image" style="height: 150px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                ${shop.imageUrl ? `<img src="${shop.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;">` : '<span style="font-size: 40px;">🏪</span>'}
            </div>
            <div class="shop-info" style="padding: 15px; flex: 1; text-align: center;">
                <h3 style="margin: 0 0 5px 0;">${shop.name}</h3>
                <p style="color: #666; font-size: 14px; margin-bottom: 15px;">${shop.description || 'Tidak ada deskripsi'}</p>
                <a href="/admin/shops/${shop.id}" class="btn btn-full" style="text-align: center;">Kelola Toko</a>
            </div>
        </div>
      `).join('');

    } catch (err) {
      container.innerHTML = `<div class="error">Gagal memuat toko: ${err.message}</div>`;
    }
  };

  return html;
}
