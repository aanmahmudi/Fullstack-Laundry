import { State } from '../../core/state.js';
import { ICONS } from '../../utils/icons.js';

export function AddProductPage() {
  const user = State.getUser();
  if (!user || user.role !== 'ADMIN') {
    return `<div class="panel error" style="margin: 20px auto; max-width: 400px; text-align: center;">Akses ditolak. Halaman ini khusus Admin.</div>`;
  }

  setTimeout(() => {
    bindEvents();
  }, 0);

  return `
    <div class="panel auth-card add-product-card">
      <h2 class="form-header">Tambah Produk Baru</h2>
      <p class="muted form-subtitle">Isi detail produk Remon Eccom</p>
      
      <form id="form-add-product" class="form-vertical">
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

function bindEvents() {
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
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    
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
      alert('Mohon pilih file gambar.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewContainer.style.display = 'flex';
      uploadPrompt.querySelector('.upload-text').textContent = 'Mengupload...';
      uploadPrompt.querySelector('.upload-hint').style.display = 'none';
      uploadPrompt.querySelector('.upload-icon').style.display = 'none';
    };
    reader.readAsDataURL(file);

    // Auto Upload
    uploadImage(file);
  }

  async function uploadImage(file) {
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      const baseUrl = (window.API && window.API.BASE_URL) || 'http://localhost:8081';
      console.log('Uploading to:', `${baseUrl}/api/products/upload-image`);
      
      const res = await fetch(`${baseUrl}/api/products/upload-image`, {
        method: 'POST',
        body: uploadData
      });
      
      if (!res.ok) {
        const text = await res.text();
        let errorDetail = text;
        try {
            const json = JSON.parse(text);
            if (json.error) errorDetail = json.error;
            if (json.message) errorDetail = json.message;
        } catch(e) {}
        throw new Error(`Server error: ${res.status} - ${errorDetail}`);
      }
      
      const data = await res.json();
      
      // Construct full URL using the current API base URL
      // data.url from backend is relative path like "/uploads/filename.jpg"
      const fullUrl = `${baseUrl}${data.url}`;
      photoUrlInput.value = fullUrl;
      
      uploadPrompt.querySelector('.upload-text').textContent = 'Foto Terupload';
      uploadPrompt.querySelector('.upload-text').style.color = 'var(--success)';
      console.log('Upload success:', data.url);
      
    } catch (err) {
      console.error('Upload failed details:', err);
      uploadPrompt.querySelector('.upload-text').textContent = 'Gagal Upload';
      uploadPrompt.querySelector('.upload-text').style.color = 'var(--error)';
      
      // Show more detailed error to user
      alert(`Gagal upload foto: ${err.message}. \n\nPastikan backend berjalan di port 8081.`);
      
      // Reset input to allow immediate retry without clicking twice if possible
      // But we already clear value on click. 
      // Maybe we can auto-clear here?
      // fileInput.value = ''; 
    }
  }

  // Form Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Prevent double submission if already processing
    if (form.dataset.submitting === 'true') return;
    
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    
    try {
      form.dataset.submitting = 'true';
      btn.disabled = true;
      btn.textContent = 'Menyimpan data...';
      
      const formData = new FormData(form);
      const user = State.getUser();
      const photoUrl = photoUrlInput.value; // Get from hidden input

      if (fileInput.files.length > 0 && !photoUrl) {
         throw new Error('Tunggu proses upload foto selesai.');
      }

      const payload = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: Number(formData.get('price').replace(/\./g, '')),
        photoUrl: photoUrl || null,
        ownerId: user && user.id ? user.id : null
      };
      
      await API.apiPost('/api/products', payload);
      
      // Success feedback
      btn.textContent = 'Berhasil!';
      btn.style.background = 'var(--success)';
      setTimeout(() => {
        delete form.dataset.submitting;
        window.location.hash = '#/products';
      }, 500);
      
    } catch (err) {
      delete form.dataset.submitting;
      alert('Error: ' + err.message);
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}
