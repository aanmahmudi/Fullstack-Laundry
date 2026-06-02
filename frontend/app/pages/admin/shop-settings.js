import { State } from '../../core/state.js';
import { validateInput, attachValidation } from '../../utils/validator.js';

export function ShopSettingsPage() {
  const user = State.getUser();
  if (!user || user.role !== 'ADMIN') {
    return `<div class="panel error">Akses ditolak. Halaman ini khusus untuk Penjual (Toko).</div>`;
  }

  setTimeout(() => {
    loadShopData();
  }, 0);

  return `
    <div class="auth-wrapper" style="align-items: flex-start; padding-top: 40px;">
      <div class="panel auth-card" style="max-width: 600px;">
        <h2 style="margin-bottom: 8px;">Pengaturan Toko</h2>
        <p class="auth-subtitle">Kelola identitas dan informasi publik toko Anda</p>
        <p id="settings-msg" class="msg"></p>

        <form id="form-shop-settings" class="form-vertical">
          <input type="hidden" name="id" id="shop-id" />
          
          <label>Nama Toko
            <div class="input-with-icon">
              <span class="icon">🏪</span>
              <input name="name" id="shop-name" type="text" required placeholder="Nama brand/toko Anda" />
            </div>
            <small class="field-error"></small>
          </label>

          <label>Deskripsi Toko
            <div class="input-with-icon" style="align-items: flex-start;">
              <span class="icon" style="top: 12px; transform: none;">📝</span>
              <textarea name="description" id="shop-description" rows="5" maxlength="500" placeholder="Ceritakan tentang toko Anda (keunggulan, layanan, dll)..." style="width: 100%; border: 1px solid #e0e0e0; border-radius: 2px; outline: none; background: #fff; padding: 12px 12px 12px 40px; resize: none; font-family: inherit; font-size: 14px; line-height: 1.4; transition: all 0.2s;"></textarea>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 4px;">
              <small class="field-error"></small>
              <small id="desc-counter" style="color: var(--text-muted); font-size: 12px;">0/500</small>
            </div>
          </label>

          <label>URL Gambar Toko (Opsional)
            <div class="input-with-icon">
              <span class="icon">🖼️</span>
              <input name="imageUrl" id="shop-image" type="text" placeholder="https://contoh.com/logo-toko.png" />
            </div>
            <small class="field-error"></small>
          </label>

          <div style="margin-top: 20px; display: flex; gap: 12px;">
            <button class="btn primary" type="submit" style="flex: 1;">Simpan Perubahan</button>
            <button class="btn" type="button" onclick="window.history.back()" style="flex: 1; background: #f1f5f9;">Batal</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

async function loadShopData() {
  const form = document.getElementById('form-shop-settings');
  const msg = document.getElementById('settings-msg');
  const descCounter = document.getElementById('desc-counter');
  
  try {
    const shop = await API.apiGet('/api/shops/mine/details');
    if (shop) {
      document.getElementById('shop-id').value = shop.id;
      document.getElementById('shop-name').value = shop.name || '';
      document.getElementById('shop-description').value = shop.description || '';
      document.getElementById('shop-image').value = shop.imageUrl || '';
      
      // Update counter
      if (descCounter) {
        descCounter.textContent = `${(shop.description || '').length}/500`;
      }
    }
    
    bindEvents(form);
  } catch (e) {
    let errorMsg = e.message;
    try {
      // If error message is a JSON string, try to parse it
      if (errorMsg.startsWith('{')) {
        const parsed = JSON.parse(errorMsg);
        errorMsg = parsed.message || parsed.error || errorMsg;
      }
    } catch {}
    
    msg.textContent = 'Gagal memuat data toko: ' + errorMsg;
    msg.classList.add('error');
    msg.style.display = 'block';
    
    if (errorMsg.includes('403') || errorMsg.includes('Forbidden') || errorMsg.includes('Authentication')) {
       msg.innerHTML += '<br><small>Sesi Anda mungkin berakhir. Silakan logout dan login kembali.</small>';
    }
  }
}

function bindEvents(form) {
  if (!form) return;
  
  const shopDesc = form.querySelector('textarea[name="description"]');
  const descCounter = document.getElementById('desc-counter');
  const msg = document.getElementById('settings-msg');

  if (shopDesc && descCounter) {
    shopDesc.addEventListener('input', () => {
      const len = shopDesc.value.length;
      descCounter.textContent = `${len}/500`;
      if (len >= 500) descCounter.style.color = 'var(--danger)';
      else descCounter.style.color = 'var(--text-muted)';
    });
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const shopId = document.getElementById('shop-id').value;
    const payload = Object.fromEntries(new FormData(form));
    
    msg.textContent = 'Menyimpan...';
    msg.classList.remove('error', 'success');
    msg.style.display = 'block';

    try {
      const res = await API.apiPut(`/api/shops/${shopId}`, payload);
      
      // Update local state so header reflects changes
      const user = State.getUser();
      State.setUser({
        ...user,
        shopName: res.name,
        shopDescription: res.description
      });

      msg.textContent = 'Pengaturan toko berhasil diperbarui!';
      msg.classList.add('success');
      
      setTimeout(() => {
        msg.style.display = 'none';
      }, 3000);
    } catch (e) {
      msg.textContent = 'Gagal menyimpan: ' + e.message;
      msg.classList.add('error');
    }
  });
}
