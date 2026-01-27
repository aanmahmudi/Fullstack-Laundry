export function HomePage() {
  window.__bindPage = null;
  
  // Shopee-style Home Page
  return `
    <div class="home-container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
      
      <!-- Banner Section -->
      <section class="banner-section" style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 20px;">
        <div class="main-banner" style="background: linear-gradient(135deg, #ee4d2d 0%, #ff7337 100%); height: 240px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; position: relative; overflow: hidden;">
           <div style="text-align: center; z-index: 1;">
              <h1 style="font-size: 2.5rem; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Belanja Hemat di Remon Eccom</h1>
              <p style="margin: 10px 0 20px; font-size: 1.1rem; opacity: 0.9;">Temukan produk terbaik dengan harga bersahabat setiap hari</p>
              <a href="#/products" class="btn" style="background: white; color: var(--primary); border: none; padding: 10px 30px; font-weight: bold; border-radius: 2px;">Belanja Sekarang</a>
           </div>
           <!-- Decorative circles -->
           <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
           <div style="position: absolute; bottom: -30px; left: -30px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
        </div>
        
        <div class="side-banners" style="display: flex; flex-direction: column; gap: 10px;">
           <div style="flex: 1; background: #ffe4dd; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--primary); font-weight: bold;">
              Gratis Ongkir Xtra
           </div>
           <div style="flex: 1; background: #fff5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #d73211; font-weight: bold;">
              Voucher Diskon 50%
           </div>
        </div>
      </section>

      <!-- Categories (Dummy) -->
      <section class="categories-section" style="background: white; padding: 20px; border-radius: 4px; box-shadow: 0 1px 1px 0 rgba(0,0,0,0.05); margin-bottom: 20px;">
         <h3 style="margin: 0 0 15px; font-size: 1rem; color: #555; text-transform: uppercase;">Kategori Pilihan</h3>
         <div style="display: flex; gap: 20px; overflow-x: auto; padding-bottom: 10px;">
            ${['Pakaian Pria', 'Pakaian Wanita', 'Elektronik', 'Rumah & Hobi', 'Kesehatan', 'Otomotif'].map(cat => `
              <div style="flex: 0 0 100px; text-align: center; cursor: pointer;">
                 <div style="width: 80px; height: 80px; background: #f5f5f5; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; border: 1px solid #eee;">
                    📦
                 </div>
                 <div style="font-size: 0.9rem; color: #333;">${cat}</div>
              </div>
            `).join('')}
         </div>
      </section>

      <!-- Flash Sale (Dummy) -->
      <section class="flash-sale" style="background: white; padding: 20px; border-radius: 4px; box-shadow: 0 1px 1px 0 rgba(0,0,0,0.05); margin-bottom: 20px;">
         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 10px;">
               <h3 style="margin: 0; color: var(--primary); font-size: 1.2rem;">⚡ FLASH SALE</h3>
               <span style="background: #333; color: white; padding: 2px 8px; border-radius: 2px; font-size: 0.8rem;">00 : 12 : 45</span>
            </div>
            <a href="#/products" style="color: var(--primary); text-decoration: none; font-size: 0.9rem;">Lihat Semua ></a>
         </div>
         <div style="display: flex; gap: 15px;">
            ${[1,2,3,4,5,6].map(() => `
               <div style="flex: 1; border: 1px solid #f1f1f1; padding: 10px;">
                  <div style="height: 120px; background: #f9f9f9; margin-bottom: 10px; display: flex; align-items: center; justify-content: center;">Produk</div>
                  <div style="color: var(--primary); font-size: 1.1rem; font-weight: bold;">Rp 99.000</div>
                  <div style="background: #ffb8b8; height: 16px; border-radius: 8px; margin-top: 5px; position: relative;">
                     <div style="position: absolute; top:0; left:0; height: 100%; width: 80%; background: #ef4444; border-radius: 8px;"></div>
                     <span style="position: absolute; width: 100%; text-align: center; font-size: 10px; color: white; line-height: 16px;">80% Terjual</span>
                  </div>
               </div>
            `).join('')}
         </div>
      </section>

      <!-- Call to Action -->
      <section style="text-align: center; padding: 40px 0;">
         <p style="color: #666; margin-bottom: 20px;">Temukan ribuan produk menarik lainnya di Remon Eccom</p>
         <a class="btn primary" href="#/products" style="padding: 12px 40px; font-size: 1.1rem;">Mulai Belanja</a>
      </section>

    </div>
  `;
}
