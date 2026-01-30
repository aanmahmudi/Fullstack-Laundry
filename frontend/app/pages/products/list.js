import { State } from '../../core/state.js?v=remon13';

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
    
    if (!grid) {
        console.error('Grid element not found!');
        return;
    }

    grid.innerHTML = '<div class="loading" style="color: #333;">Memuat produk...</div>';
    
    try {
      console.log('Products Page v8 Loaded');
      // API Call wrapper with search support
      const fetchProducts = async (query = '') => {
        let url = '/api/products';
        if (query) {
            url += `?search=${encodeURIComponent(query)}`;
        }
        return await API.apiGet(url);
      };

      // Initial load (no search)
      let items = await fetchProducts();
      
      // Safety check if navigated away
      if (!document.getElementById('products-grid')) return;

      const render = (list) => {
        if (!list || list.length === 0) {
            grid.innerHTML = '<div class="panel" style="grid-column: 1/-1; text-align: center; background: white; color: #333; padding: 40px;">Tidak ada produk ditemukan.</div>';
            return;
        }
        grid.innerHTML = list.map((p) => productCard(p, user)).join('');
        
        // Re-attach event listeners for buttons
        const addToCart = (id) => {
             // Look up in current displayed list first
             const prod = list.find((x) => x.id === id);
             if (prod) {
                 State.addToCart({ id: prod.id, name: prod.name, price: prod.price, qty: 1, photoUrl: prod.photoUrl });
                 return true;
             }
             return false;
        };

        // Handle "Keranjang" (Add to Cart only)
        grid.querySelectorAll('.btn-add-cart').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            if (addToCart(id)) {
                // Visual feedback
                const originalText = btn.innerHTML;
                btn.innerHTML = "Masuk Keranjang!";
                btn.style.color = "#22c55e";
                btn.style.borderColor = "#22c55e";
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.color = "";
                    btn.style.borderColor = "";
                }, 1500);
            }
          });
        });

        // Handle "Beli" (Add to Cart + Checkout)
        grid.querySelectorAll('.btn-buy-now').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            if (addToCart(id)) {
                 window.location.hash = '#/checkout';
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
              // Refresh data from server to ensure sync
              refresh.click();
            } catch (err) {
              alert('Gagal menghapus produk: ' + err.message);
            }
          });
        });
      };
      
      render(items);
      
      // Debounce utility
      const debounce = (func, wait) => {
        let timeout;
        return function(...args) {
          const context = this;
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(context, args), wait);
        };
      };

      // Server-side search handler
      const handleSearch = async (q) => {
        const query = String(q || '').trim();
        const currentGrid = document.getElementById('products-grid');
        if (currentGrid) currentGrid.innerHTML = '<div class="loading" style="color: #333;">Mencari produk...</div>';
        
        try {
           const filtered = await fetchProducts(query);
           if (!document.getElementById('products-grid')) return;
           render(filtered);
        } catch (e) {
           if (document.getElementById('products-grid')) {
               document.getElementById('products-grid').innerHTML = `<div class="error" style="color: red;">${e.message}</div>`;
           }
        }
      };
      
      const debouncedSearch = debounce(handleSearch, 500);

      search.addEventListener('input', () => {
        debouncedSearch(search.value);
      });
      
      window.addEventListener('global:search', (e) => {
        const q = e.detail && e.detail.q ? e.detail.q : '';
        if (search) search.value = q;
        // Immediate search for explicit submit
        handleSearch(q);
      });
      
      refresh.addEventListener('click', async () => {
        if (document.getElementById('products-grid')) {
            document.getElementById('products-grid').innerHTML = '<div class="loading" style="color: #333;">Memuat produk...</div>';
        }
        search.value = '';
        try {
            items = await fetchProducts();
            if (!document.getElementById('products-grid')) return;
            render(items);
        } catch (e) {
             if (document.getElementById('products-grid')) {
                document.getElementById('products-grid').innerHTML = `<div class="error" style="color: red;">${e.message}</div>`;
             }
        }
      });
      
    } catch (e) {
      if (document.getElementById('products-grid')) {
         grid.innerHTML = `<div class="error" style="color: red;">${e.message}</div>`;
      }
    }
  };

  return html;
}

function productCard(p, user) {
  let photoUrl = p.photoUrl;
  if (photoUrl && photoUrl.startsWith('/')) {
      const baseUrl = (window.API && window.API.BASE_URL) || 'http://localhost:8081';
      photoUrl = baseUrl + photoUrl;
  }
  
  const hasPhoto = !!photoUrl;
  const placeholder = "https://placehold.co/400x300/f1f5f9/94a3b8?text=No+Image";
  const photoHtml = hasPhoto
    ? `<img src="${photoUrl}" alt="${p.name}" onerror="this.onerror=null;this.src='${placeholder}';this.alt='No Image';"/>`
    : `<img src="${placeholder}" alt="No Image"/>`;
  const description = p.description || 'Produk berkualitas pilihan dari Remon Eccom.';
  const price = (Number(p.price) || 0).toLocaleString('id-ID');
  const isOwnerAdmin = user && user.role === 'ADMIN' && String(p.ownerId || '') === String(user.id || '');
  const ownerBadge = isOwnerAdmin
    ? `<span class="owner-badge">Produk saya</span>`
    : '';
  const deleteButton = isOwnerAdmin
    ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;">
         <button class="btn btn-delete-product" data-id="${p.id}" style="width: 100%;">Hapus Produk</button>
       </div>`
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
      <div class="card-actions" style="flex-direction: column; gap: 10px;">
        <div style="display: flex; gap: 10px; width: 100%;">
            <a class="btn btn-detail" href="#/product/${p.id}" style="flex: 1; text-align: center;">Detail</a>
            ${isOwnerAdmin 
              ? `<button class="btn btn-buy" disabled style="flex: 1; opacity: 0.5; cursor: not-allowed; background: #94a3b8; border-color: #94a3b8;">Milik Anda</button>`
              : `<button class="btn btn-buy btn-buy-now" data-id="${p.id}" style="flex: 1; background: #ee4d2d; color: white; border: none;">Beli</button>`
            }
        </div>
        ${!isOwnerAdmin ? 
           `<button class="btn btn-add-cart" data-id="${p.id}" style="width: 100%; border: 1px solid #ee4d2d; color: #ee4d2d; background: white; margin-top: 5px;">
              <span style="font-size: 1.2em; margin-right: 5px;">🛒</span> + Keranjang
            </button>` : ''
        }
      </div>
      ${deleteButton ? `<div style="padding: 0 24px 24px;">${deleteButton}</div>` : ''}
    </article>
  `;
}
