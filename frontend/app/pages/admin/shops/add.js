import { State } from '../../../core/state.js';

export function ShopAddPage() {
  const user = State.getUser();
  if (!user || user.role !== 'ADMIN') {
    setTimeout(() => { window.location.hash = '#/'; }, 0);
    return '';
  }

  const html = `
  <div class="panel auth-card" style="margin: 40px auto; max-width: 500px;">
    <h2 class="form-header">Buat Toko Baru</h2>
    <p class="muted form-subtitle">Mulai berjualan dengan membuat toko Anda</p>
    
    <form id="form-create-shop" class="form-vertical">
      <label>Nama Toko
        <div class="input-with-icon">
          <span class="icon">🏪</span>
          <input name="name" type="text" required placeholder="Contoh: Toko Elektronik Jaya" />
        </div>
      </label>
      
      <label>Deskripsi Toko
        <div class="input-with-icon">
          <span class="icon">📝</span>
          <textarea name="description" rows="3" placeholder="Deskripsi singkat tentang toko Anda..." style="width: 100%; border: 1px solid #ccc; padding: 10px; border-radius: 4px;"></textarea>
        </div>
      </label>
      
      <div class="actions form-actions">
        <a href="#/admin/shops" class="btn btn-full">Batal</a>
        <button type="submit" class="btn primary btn-full">Buat Toko</button>
      </div>
    </form>
  </div>`;

  window.__bindPage = async () => {
    const form = document.getElementById('form-create-shop');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Menyimpan...';

        try {
          const formData = new FormData(form);
          const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            ownerId: user.id
          };

          const res = await API.apiPost('/api/shops', data);
          if (res) {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil!',
              text: 'Toko berhasil dibuat',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              window.location.hash = `#/admin/shops/${res.id}`;
            });
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: err.message
          });
          btn.disabled = false;
          btn.textContent = 'Buat Toko';
        }
      });
    }
  };

  return html;
}
