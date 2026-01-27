import { State } from '../../core/state.js';

export function ProductsPage() {
  const html = `
  <div class="hero-section">
    <div class="hero-content">
      <h1>Belanja Hemat di Remon Eccom</h1>
      <p>Temukan produk terbaik dengan harga bersahabat setiap hari</p>
    </div>
  </div>

  <section class="product-layout" style="max-width: 1200px; margin: 0 auto;">
      <div class="actions" style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
        <h2 style="margin: 0; color: #1a1a1a; font-size: 2rem;">Produk Terbaru</h2>
        <div style="display: flex; gap: 10px; flex: 1; max-width: 400px;">
            <input id="search" class="input" placeholder="Cari produk..." style="background: white; border: 1px solid #e2e8f0; color: #333; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"/>
            <button id="btn-refresh" class="btn" style="background: #1a1a1a; color: white;">Refresh</button>
        </div>
      </div>
      <div id="products-grid" class="grid"></div>
  </section>`;

  window.__bindPage = async () => {
    const grid = document.getElementById('products-grid');
    const search = document.getElementById('search');
    const refresh = document.getElementById('btn-refresh');
    const user = State.getUser();
    
    grid.innerHTML = '<div class="loading" style="color: #333;">Memuat produk...</div>';
    
    try {
      let items = await API.apiGet('/api/products');
      const render = (list) => {
        if (list.length === 0) {
            grid.innerHTML = '<div class="panel" style="grid-column: 1/-1; text-align: center; background: white; color: #333;">Tidak ada produk ditemukan.</div>';
            return;
        }
        grid.innerHTML = list.map((p) => productCard(p, user)).join('');
        
        // Re-attach event listeners for "Beli" buttons
        grid.querySelectorAll('.btn-add').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            const prod = list.find((x) => x.id === id) || items.find((x) => x.id === id);
            if (prod) {
                State.addToCart({ id: prod.id, name: prod.name, price: prod.price, qty: 1, photoUrl: prod.photoUrl });
                // Visual feedback
                const originalText = btn.innerText;
                btn.innerText = "Berhasil!";
                btn.style.background = "#22c55e";
                btn.style.borderColor = "#22c55e";
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = "";
                    btn.style.borderColor = "";
                }, 1500);
            }
          });
        });
        
        grid.querySelectorAll('.btn-delete-product').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const id = Number(btn.dataset.id);
            const currentUser = State.getUser();
            if (!currentUser || currentUser.role !== 'ADMIN') {
              alert('Hanya admin yang dapat menghapus produk.');
              return;
            }
            if (!confirm('Yakin ingin menghapus produk ini?')) {
              return;
            }
            try {
              const baseUrl = (window.API && window.API.BASE_URL) || '';
              const res = await fetch(`${baseUrl}/api/products/${id}?requesterId=${currentUser.id}`, {
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
              items = items.filter((x) => x.id !== id);
              render(items);
            } catch (err) {
              alert('Gagal menghapus produk: ' + err.message);
            }
          });
        });
      };
      
      render(items);
      
      // renderCartSummary removed as sidebar is gone, rely on header or toast
      
      const doFilter = (q) => {
        const query = String(q || '').toLowerCase();
        const filtered = items.filter((p) =>
          String(p.name || '').toLowerCase().includes(query) || String(p.description || '').toLowerCase().includes(query)
        );
        render(filtered);
      };
      
      search.addEventListener('input', () => {
        doFilter(search.value);
      });
      
      window.addEventListener('global:search', (e) => {
        const q = e.detail && e.detail.q ? e.detail.q : '';
        if (search) search.value = q;
        doFilter(q);
      });
      
      refresh.addEventListener('click', async () => {
        grid.innerHTML = '<div class="loading" style="color: #333;">Memuat produk...</div>';
        items = await API.apiGet('/api/products');
        search.value = '';
        render(items);
      });
      
    } catch (e) {
      grid.innerHTML = `<div class="error" style="color: red;">${e.message}</div>`;
    }
  };

  return html;
}

function productCard(p, user) {
  const hasPhoto = !!p.photoUrl;
  const photoHtml = hasPhoto
    ? `<img src="${p.photoUrl}" alt="${p.name}"/>`
    : `<img src="https://placehold.co/400x300/f1f5f9/94a3b8?text=No+Image" alt="No Image"/>`;
  const description = p.description || 'Produk berkualitas pilihan dari Remon Eccom.';
  const price = (Number(p.price) || 0).toLocaleString('id-ID');
  const isOwnerAdmin = user && user.role === 'ADMIN' && String(p.ownerId || '') === String(user.id || '');
  const ownerBadge = isOwnerAdmin
    ? `<span class="owner-badge">Produk saya</span>`
    : '';
  const deleteButton = isOwnerAdmin
    ? `<button class="btn btn-delete-product" data-id="${p.id}">Hapus</button>`
    : '';

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
      <div class="card-actions">
        <a class="btn btn-detail" href="#/product/${p.id}">Detail</a>
        <button class="btn btn-buy btn-add" data-id="${p.id}">Beli</button>
        ${deleteButton}
      </div>
    </article>
  `;
}
