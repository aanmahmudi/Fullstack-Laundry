import { State } from '../../core/state.js';
import { validateInput, attachValidation } from '../../utils/validator.js';
import { ICONS } from '../../utils/icons.js';

export function RegisterPage() {
  setTimeout(() => {
    bindEvents();
  }, 0);

  return `
    <div class="auth-wrapper">
      <div class="panel auth-card" style="max-width: 520px;">
        <h2 id="auth-title">Buat Akun Baru</h2>
        <p id="auth-subtitle" class="auth-subtitle">Bergabunglah dan mulai belanja di Remon Eccom</p>
        <p id="auth-msg" class="msg"></p>

        <form id="form-register" class="form-vertical">
          <label><span id="lbl-name">Nama Lengkap</span>
            <div class="input-with-icon">
              <span class="icon">👤</span>
              <input id="input-name" name="username" type="text" required placeholder="Nama Anda" />
            </div>
            <small class="field-error"></small>
          </label>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
             <label>Email
               <div class="input-with-icon">
                 <span class="icon">@</span>
                 <input name="email" type="email" required placeholder="email@contoh.com" />
               </div>
               <small class="field-error"></small>
             </label>
             <label>No. HP
               <div class="input-with-icon">
                 <span class="icon">📱</span>
                 <input name="phoneNumber" type="text" required pattern="[0-9]{12,13}" inputmode="numeric" placeholder="08..." />
               </div>
               <small class="field-error"></small>
             </label>
          </div>

          <label>Password
            <div class="input-with-icon">
              <span class="icon">🔒</span>
              <input name="password" type="password" required minlength="8" placeholder="Minimal 8 karakter" />
              <button type="button" class="password-toggle" title="Lihat Password">${ICONS.eye}</button>
            </div>
            <small class="field-error"></small>
          </label>

          <label>Daftar Sebagai</label>
          <div class="role-selector">
             <button type="button" class="role-btn active" data-value="USER">
               <span>👤</span> Pembeli
             </button>
             <button type="button" class="role-btn" data-value="ADMIN">
               <span>🏪</span> Penjual (Toko)
             </button>
          </div>
          <input type="hidden" name="role" id="role-input" value="USER" />

          <!-- Field Khusus Penjual (Toko) -->
          <div id="seller-fields" style="display: none; border: 1px dashed var(--border-color); padding: 16px; border-radius: 8px; margin-bottom: 16px; background: rgba(0,0,0,0.02);">
            <p style="font-weight: 600; margin-bottom: 12px; color: var(--primary-color);">Informasi Toko</p>
            <label>Nama Toko
              <div class="input-with-icon">
                <span class="icon">🏪</span>
                <input name="shopName" type="text" placeholder="Nama brand/toko Anda" />
              </div>
              <small class="field-error"></small>
            </label>
            <label>Deskripsi Toko
              <div class="input-with-icon" style="align-items: flex-start;">
                <span class="icon" style="top: 12px; transform: none;">📝</span>
                <textarea name="shopDescription" rows="3" maxlength="200" placeholder="Ceritakan tentang toko Anda (kategori produk, keunggulan, dll)..." style="width: 100%; border: 1px solid #e0e0e0; border-radius: 2px; outline: none; background: #fff; padding: 12px 12px 12px 40px; resize: none; font-family: inherit; font-size: 14px; line-height: 1.4; transition: all 0.2s;"></textarea>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                <small class="field-error"></small>
                <small id="desc-counter" style="color: var(--text-muted); font-size: 12px;">0/200</small>
              </div>
            </label>
          </div>

          <label>No. KTP (NIK)
            <div class="input-with-icon">
              <span class="icon">🆔</span>
              <input name="ktpNumber" type="text" required pattern="[0-9]{16}" maxlength="16" inputmode="numeric" placeholder="16 digit NIK" />
            </div>
            <small class="field-error"></small>
          </label>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <label><span id="lbl-pob">Tempat Lahir</span>
              <div class="input-with-icon">
                <span class="icon">📍</span>
                <input id="input-pob" name="placeOfBirth" type="text" placeholder="Kota" />
              </div>
            </label>
            <label><span id="lbl-dob">Tanggal Lahir</span>
              <div class="input-with-icon">
                <span class="icon">📅</span>
                <input id="input-dob" name="dateOfBirth" type="date" required />
              </div>
            </label>
          </div>

          <label><span id="lbl-address">Alamat Lengkap</span>
            <div class="input-with-icon">
              <span class="icon">🏠</span>
              <input id="input-address" name="address" type="text" placeholder="Jalan, No. Rumah, Kota" />
            </div>
            <small class="field-error"></small>
          </label>

          <button class="btn primary full-width" type="submit">Daftar Sekarang</button>
          <div class="auth-footer">
             <span>Sudah punya akun? <a href="/login">Login disini</a></span>
          </div>
        </form>
      </div>
    </div>
  `;
}

function bindEvents() {
  const register = document.getElementById('form-register');
  const msg = document.getElementById('auth-msg');

  if (register) {
    // Setup password toggles
    register.querySelectorAll('.password-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerHTML = ICONS.eyeOff;
        } else {
          input.type = 'password';
          btn.innerHTML = ICONS.eye;
        }
      });
    });

    // Setup Role Toggle
    const roleInput = document.getElementById('role-input');
    const roleBtns = register.querySelectorAll('.role-btn');
    const sellerFields = document.getElementById('seller-fields');
    
    roleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active from all
        roleBtns.forEach(b => b.classList.remove('active'));
        // Add active to clicked
        btn.classList.add('active');
        // Update hidden input
        const role = btn.dataset.value;
        roleInput.value = role;

        // Show/hide seller fields
        if (role === 'ADMIN') {
          sellerFields.style.display = 'block';
          sellerFields.querySelectorAll('input, textarea').forEach(el => el.setAttribute('required', 'true'));
        } else {
          sellerFields.style.display = 'none';
          sellerFields.querySelectorAll('input, textarea').forEach(el => el.removeAttribute('required'));
        }
      });
    });

    // Shop Description Counter
    const shopDesc = register.querySelector('textarea[name="shopDescription"]');
    const descCounter = document.getElementById('desc-counter');
    if (shopDesc && descCounter) {
      shopDesc.addEventListener('input', () => {
        const len = shopDesc.value.length;
        descCounter.textContent = `${len}/200`;
        if (len >= 200) descCounter.style.color = 'var(--danger)';
        else descCounter.style.color = 'var(--text-muted)';
      });
    }

    attachValidation(register, 'register');
    register.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const payload = Object.fromEntries(new FormData(register));
      
      // Validasi NIK 16 digit khusus
      if (!/^\d{16}$/.test(payload.ktpNumber)) {
        alert('No. KTP harus tepat 16 digit angka!');
        return;
      }

      const valid = [...register.querySelectorAll('input, textarea')].every((i) => validateInput(i, 'register'));
      if (!valid) { msg.textContent = 'Periksa kembali data pendaftaran.'; msg.classList.add('error'); return; }
      
      msg.textContent = 'Mendaftar...'; msg.classList.remove('error');
      try {
        const res = await API.apiPost('/api/auth/register', payload);
        State.setPendingEmail(payload.email);
        msg.textContent = `Registrasi sukses. Silakan verifikasi OTP yang dikirim ke ${payload.email}.`;
        window.location.href = '/verify';
      } catch (e) {
        msg.textContent = e.message; msg.classList.add('error');
      }
    });
  }
}
