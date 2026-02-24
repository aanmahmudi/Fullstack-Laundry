export function PublicShopDetailPage(params) {
  const shopId = params.id;
  const html = `
    <section class="container" style="max-width: 1200px; margin: 20px auto; padding: 0 20px 40px;">
      <div id="public-shop-detail">
        <div style="text-align:center; padding:40px; color:#64748b;">Memuat detail toko...</div>
      </div>
    </section>
  `;

  window.__bindPage = async () => {
    const box = document.getElementById('public-shop-detail');
    if (!box) return;

    try {
      const shop = await API.apiGet(`/api/shops/${shopId}`);
      const products = await API.apiGet(`/api/products?shopId=${shopId}`);

      let headerImage = shop.imageUrl || null;
      if (headerImage && headerImage.startsWith('/')) {
        const baseUrl = (window.API && window.API.BASE_URL) || 'http://localhost:8081';
        headerImage = baseUrl + headerImage;
      }

      box.innerHTML = `
        <div style="background:#111827;border-radius:12px;padding:20px 24px;color:white;display:flex;align-items:center;gap:16px;margin-bottom:24px;">
          <div style="width:56px;height:56px;border-radius:999px;overflow:hidden;background:#0f172a;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;">
            ${
              headerImage
                ? `<img src="${headerImage}" alt="${shop.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.textContent='${(shop.name || 'Toko').charAt(0).toUpperCase()}';" />`
                : (shop.name || 'Toko').charAt(0).toUpperCase()
            }
          </div>
          <div style="flex:1;">
            <h1 style="margin:0 0 4px 0;font-size:20px;">${shop.name}</h1>
            <p style="margin:0;font-size:13px;color:#e5e7eb;">${shop.description || 'Toko belum menambahkan deskripsi.'}</p>
          </div>
        </div>

        <div>
          <h2 style="margin:0 0 12px 0;font-size:18px;color:#111827;">Produk dari Toko Ini</h2>
          ${
            !products.length
              ? `<div style="padding:32px;text-align:center;border:1px solid #e5e7eb;border-radius:8px;color:#6b7280;">Belum ada produk di toko ini.</div>`
              : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:16px;">
            ${products
              .map((p) => {
                let photoUrl = p.photoUrl;
                if (photoUrl && photoUrl.startsWith('/')) {
                  const baseUrl = (window.API && window.API.BASE_URL) || 'http://localhost:8081';
                  photoUrl = baseUrl + photoUrl;
                }
                const safePhoto =
                  photoUrl ||
                  "https://via.placeholder.com/300?text=No+Image";
                return `
                  <a href="/products/${p.id}" style="display:block;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:white;text-decoration:none;color:inherit;">
                    <div style="width:100%;aspect-ratio:1/1;background:#f9fafb;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                      <img src="${safePhoto}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=No+Image';" />
                    </div>
                    <div style="padding:8px 10px;">
                      <div style="font-size:14px;font-weight:500;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                      <div style="font-size:13px;color:#ef4444;font-weight:600;">Rp ${parseInt(p.price).toLocaleString('id-ID')}</div>
                    </div>
                  </a>
                `;
              })
              .join('')}
          </div>
              `
          }
        </div>
      `;
    } catch (err) {
      console.error(err);
      if (box) {
        box.innerHTML = `<div style="padding:32px;text-align:center;border:1px solid #fecaca;border-radius:8px;background:#fef2f2;color:#b91c1c;">Gagal memuat toko: ${err.message}</div>`;
      }
    }
  };

  return html;
}

