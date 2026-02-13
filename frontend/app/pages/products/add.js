import { State } from '../../core/state.js';
import { ICONS } from '../../utils/icons.js';

export function AddProductPage(params) {
  const user = State.getUser();
  if (!user || user.role !== 'ADMIN') {
    return `<div class="panel error" style="margin: 20px auto; max-width: 400px; text-align: center;">Akses ditolak. Halaman ini khusus Admin.</div>`;
  }

  // Get shopId from params (injected by router) or URL fallback
  const shopId = params?.shopId || new URLSearchParams(window.location.hash.split('?')[1]).get('shopId');

  setTimeout(() => {
    bindEvents(shopId);
  }, 0);

  return `
    <div class="panel auth-card add-product-card">
      <h2 class="form-header">Tambah Produk Baru</h2>
      <p class="muted form-subtitle">${shopId ? 'Menambahkan produk ke Toko' : 'Isi detail produk untuk ditampilkan di katalog'}</p>
      
      <form id="form-add-product" class="form-vertical">
        <input type="hidden" name="shopId" value="${shopId || ''}" />
        <label>Nama Produk
          <div class="input-with-icon">
            <span class="icon">🏷️</span>
            <input name="name" type="text" required placeholder="Contoh: Cuci Kering Hemat" />
          </div>
        </label>
        
        <label style="display: block; margin-bottom: 8px;">Deskripsi
          <div style="position: relative;">
            <span style="position: absolute; left: 12px; top: 12px; font-size: 16px; z-index: 10; pointer-events: none;">📝</span>
            <textarea name="description" rows="3" placeholder="Deskripsi singkat produk..." 
              style="width: 100%; box-sizing: border-box; background: #fff; border: 1px solid #e0e0e0; border-radius: 2px; color: #333; outline: none; padding: 12px 12px 12px 40px; font-family: inherit; resize: vertical; min-height: 100px; display: block;"></textarea>
          </div>
        </label>
        
        <label>Harga (Rp)
          <div class="input-with-icon">
            <span class="icon">💰</span>
            <input name="price" type="text" inputmode="numeric" required placeholder="0" id="price-input" />
          </div>
        </label>
        
        <div class="form-group">
          <label class="form-label">Foto Produk</label>
          <div class="file-upload-container">
            <input type="file" id="file-input" accept="image/*" style="display: none;" />
            <div id="drop-zone" class="drop-zone">
              <div id="preview-container" class="preview-container" style="display: none;">
                <img id="preview-img" class="preview-img" src="" alt="Preview" />
              </div>
              <div id="upload-prompt">
                <span class="upload-icon">🖼️</span>
                <span class="upload-text">Pilih Foto</span>
                <span class="upload-hint">atau drag & drop disini</span>
              </div>
            </div>
            <input type="hidden" name="photoUrl" id="photo-url-input" />
          </div>
        </div>
        
        <div class="actions form-actions">
          <a href="#/products" class="btn btn-full">Batal</a>
          <button type="submit" class="btn primary btn-full">Simpan Produk</button>
        </div>
      </form>
    </div>
  `;
}

function bindEvents(shopId) {
  const form = document.getElementById('form-add-product');
  const fileInput = document.getElementById('file-input');
  const dropZone = document.getElementById('drop-zone');
  const previewContainer = document.getElementById('preview-container');
  const previewImg = document.getElementById('preview-img');
  const uploadPrompt = document.getElementById('upload-prompt');
  const photoUrlInput = document.getElementById('photo-url-input');

  if (!form) return;

  // Prevent double binding
  if (form.dataset.bound) return;
  form.dataset.bound = 'true';

  // Format price input
  const priceInput = document.getElementById('price-input');
  if (priceInput) {
    priceInput.addEventListener('input', (e) => {
      // Remove non-numeric characters
      let value = e.target.value.replace(/\D/g, '');
      // Format with thousand separator
      if (value) {
        value = parseInt(value, 10).toLocaleString('id-ID');
      }
      e.target.value = value;
    });
  }

  // File Upload Handling
  dropZone.addEventListener('click', () => {
    fileInput.value = ''; // Clear value to allow re-selecting same file
    fileInput.click();
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      handleFile(fileInput.files[0]);
    }
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Mohon upload file gambar', 'error');
      return;
    }

    // Show loading state
    uploadPrompt.innerHTML = '<span class="upload-text">Mengupload...</span>';
    
    // Simulate upload (in real app, upload to server here)
    // For now, use FileReader for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewContainer.style.display = 'block';
      uploadPrompt.style.display = 'none';
      
      // Upload to server
      uploadImage(file);
    };
    reader.readAsDataURL(file);
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const baseUrl = window.API && window.API.BASE_URL ? window.API.BASE_URL : 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/api/products/upload-image`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      photoUrlInput.value = data.url;
      
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire('Error', 'Gagal mengupload gambar', 'error');
      uploadPrompt.innerHTML = `
        <span class="upload-icon">🖼️</span>
        <span class="upload-text">Pilih Foto</span>
        <span class="upload-hint">atau drag & drop disini</span>
      `;
      uploadPrompt.style.display = 'flex';
      previewContainer.style.display = 'none';
    }
  }

  // Form Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    try {
      const formData = new FormData(form);
      const user = State.getUser();
      
      const priceStr = formData.get('price').replace(/\./g, '');
      const price = parseInt(priceStr, 10);

      const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: price,
        photoUrl: formData.get('photoUrl'),
        ownerId: user.id,
        shopId: formData.get('shopId') || null
      };

      await API.apiPost('/api/products', productData);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Produk berhasil ditambahkan',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        if (shopId) {
          window.location.hash = `#/admin/shops/${shopId}`;
        } else {
          window.location.hash = '#/products';
        }
      });

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.message || 'Terjadi kesalahan saat menyimpan produk'
      });
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}
