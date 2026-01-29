import { State } from '../../core/state.js';

export function MyProductsPage() {
  const user = State.getUser();
  
  // Security check
  if (!user || user.role !== 'ADMIN') {
    setTimeout(() => { window.location.hash = '#/'; }, 0);
    return '';
  }

  const html = `
  <div class="hero-section" style="height: 200px; margin-bottom: 20px;">
    <div class="hero-content">
      <h1>Produk Saya</h1>
      <p>Kelola daftar produk yang Anda miliki</p>
    </div>
  </div>

  <section class="product-layout" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
      <div class="actions" style="margin-bottom: 20px;">
        <a href="#/products/add" class="btn btn-buy" style="display: inline-block;">+ Tambah Produk Baru</a>
      </div>
      <div id="my-products-grid" class="grid"></div>
  </section>`;

  window.__bindPage = async () => {
    const grid = document.getElementById('my-products-grid');
    grid.innerHTML = '<div class="loading" style="color: #333;">Memuat produk Anda...</div>';

    try {
      const allItems = await API.apiGet('/api/products');
      
      // Filter only products owned by this admin
      // Note: products with null ownerId are not owned by anyone
      const myItems = allItems.filter(p => String(p.ownerId || '') === String(user.id || ''));

      const render = (list) => {
        if (list.length === 0) {
            grid.innerHTML = `
              <div class="panel" style="grid-column: 1/-1; text-align: center; background: white; color: #333; padding: 60px 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
                <h3 style="margin-bottom: 10px;">Belum ada produk</h3>
                <p style="color: #666; margin-bottom: 20px;">Anda belum menambahkan produk apapun ke toko.</p>
                <a href="#/products/add" class="btn btn-buy">Mulai Jualan</a>
              </div>`;
            return;
        }
        grid.innerHTML = list.map((p) => productCard(p)).join('');
        
        // Bind delete buttons
        grid.querySelectorAll('.btn-delete-product').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const id = Number(btn.dataset.id);
            if (!confirm('Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.')) {
              return;
            }
            
            // Visual feedback - loading state
            btn.innerText = 'Menghapus...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            try {
              const baseUrl = (window.API && window.API.BASE_URL) || '';
              const res = await fetch(`${baseUrl}/api/products/${id}?requesterId=${user.id}`, {
                method: 'DELETE'
              });
              
              if (!res.ok) {
                const text = await res.text();
                let msg = text;
                try {
                    const json = JSON.parse(text);
                    if (json.message) msg = json.message;
                } catch {}
                throw new Error(msg);
              }
              
              // Success
              const newList = list.filter((x) => x.id !== id);
              render(newList);
              
              // Show toast/notification if possible, or just alert
              // alert('Produk berhasil dihapus'); 
            } catch (err) {
              alert('Gagal menghapus produk: ' + err.message);
              // Reset button
              btn.innerText = 'Hapus';
              btn.disabled = false;
              btn.style.opacity = '1';
            }
          });
        });
      };
      
      render(myItems);
      
    } catch (e) {
      grid.innerHTML = `<div class="error" style="color: red; padding: 20px; text-align: center;">Gagal memuat data: ${e.message}</div>`;
    }
  };

  return html;
}

function productCard(p) {
  let photoUrl = p.photoUrl;
  if (photoUrl && photoUrl.startsWith('/')) {
      const baseUrl = (window.API && window.API.BASE_URL) || 'http://localhost:8081';
      photoUrl = baseUrl + photoUrl;
  }

  const hasPhoto = !!photoUrl;
  const photoHtml = hasPhoto
    ? `<img src="${photoUrl}" alt="${p.name}"/>`
    : `<img src="https://placehold.co/400x300/f1f5f9/94a3b8?text=No+Image" alt="No Image"/>`;
  
  const description = p.description || 'Deskripsi tidak tersedia.';
  const price = (Number(p.price) || 0).toLocaleString('id-ID');
  
  // Always show badge and delete button on this page since it's "My Products"
  const ownerBadge = `<span class="owner-badge">Produk Saya</span>`;
  const deleteButton = `<button class="btn btn-delete-product" data-id="${p.id}" style="width: 100%;">Hapus Produk</button>`;

  return `
    <article class="card">
      <figure class="thumb">
        ${photoHtml}
        ${ownerBadge}
      </figure>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${description}</p>
        <div class="price">Rp ${price}</div>
      </div>
      <div class="card-actions" style="flex-direction: column;">
        <a class="btn btn-detail" href="#/product/${p.id}" style="text-align: center;">Lihat Detail</a>
        ${deleteButton}
      </div>
    </article>
  `;
}
