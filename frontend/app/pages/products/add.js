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
      <p class="muted form-subtitle">Isi detail produk laundry</p>
      
      <form id="form-add-product" class="form-vertical">
        <label>Nama Produk
          <div class="input-with-icon">
            <span class="icon">🏷️</span>
            <input name="name" type="text" required placeholder="Contoh: Cuci Kering Hemat" />
          </div>
        </label>
        
        <label>Deskripsi
          <div class="input-with-icon" style="align-items: flex-start;">
            <span class="icon" style="margin-top: 10px;">📝</span>
            <textarea name="description" rows="3" placeholder="Deskripsi singkat produk..." 
              style="flex: 1; background: transparent; border: none; color: var(--text); outline: none; padding: 8px 0; font-family: inherit; resize: vertical; min-height: 80px;"></textarea>
          </div>
        </label>
        
        <label>Harga (Rp)
          <div class="input-with-icon">
            <span class="icon">💰</span>
            <input name="price" type="number" required min="0" placeholder="0" />
          </div>
        </label>
        
        <label>Foto Produk
          <div class="file-upload-container">
            <input type="file" id="file-input" accept="image/*" style="display: none;" />
            <div id="drop-zone" class="drop-zone">
              <div id="preview-container" class="preview-container">
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
        </label>
        
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

  // File Upload Handling
  dropZone.addEventListener('click', () => fileInput.click());

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
      uploadPrompt.querySelector('.upload-text').textContent = 'Ganti Foto';
      uploadPrompt.querySelector('.upload-hint').style.display = 'none';
      uploadPrompt.querySelector('.upload-icon').style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  // Form Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    
    try {
      btn.disabled = true;
      btn.textContent = 'Menyimpan...';

      // 1. Upload Photo if selected
      let finalPhotoUrl = null;
      if (fileInput.files.length > 0) {
        btn.textContent = 'Mengupload foto...';
        const uploadData = new FormData();
        uploadData.append('file', fileInput.files[0]);
        
        try {
          // Note: We need to use fetch directly or ensure API wrapper handles FormData correctly without setting Content-Type to json
          const res = await fetch('http://localhost:8080/api/products/upload-image', {
            method: 'POST',
            body: uploadData
            // Do NOT set Content-Type header, browser does it for FormData
          });
          
          if (!res.ok) throw new Error('Gagal upload foto');
          const data = await res.json();
          finalPhotoUrl = data.url;
        } catch (uploadErr) {
          throw new Error('Gagal upload foto: ' + uploadErr.message);
        }
      }

      btn.textContent = 'Menyimpan data...';
      
      const formData = new FormData(form);
      const payload = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: Number(formData.get('price')),
        photoUrl: finalPhotoUrl // Use the uploaded URL
      };
      
      await API.apiPost('/api/products', payload);
      
      // Success feedback
      btn.textContent = 'Berhasil!';
      btn.style.background = 'var(--success)';
      setTimeout(() => {
        window.location.hash = '#/products';
      }, 500);
      
    } catch (err) {
      alert('Error: ' + err.message);
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}
