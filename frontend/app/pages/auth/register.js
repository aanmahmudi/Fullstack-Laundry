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
          <label>Nama Lengkap
            <div class="input-with-icon">
              <span class="icon">👤</span>
              <input name="username" type="text" required placeholder="Nama Anda" />
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
               <span>👤</span> Customer
             </button>
             <button type="button" class="role-btn" data-value="ADMIN">
               <span>🛠️</span> Admin
             </button>
          </div>
          <input type="hidden" name="role" id="role-input" value="USER" />

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <label>Tempat Lahir
              <div class="input-with-icon">
                <span class="icon">📍</span>
                <input name="placeOfBirth" type="text" placeholder="Kota" />
              </div>
            </label>
            <label>Tanggal Lahir
              <div class="input-with-icon">
                <span class="icon">📅</span>
                <input name="dateOfBirth" type="date" required />
              </div>
            </label>
          </div>

          <label>Alamat Lengkap
            <div class="input-with-icon">
              <span class="icon">🏠</span>
              <input name="address" type="text" placeholder="Jalan, No. Rumah, Kota" />
            </div>
            <small class="field-error"></small>
          </label>

          <button class="btn primary full-width" type="submit">Daftar Sekarang</button>
          <div class="auth-footer">
             <span>Sudah punya akun? <a href="#/login">Login disini</a></span>
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
    
    roleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active from all
        roleBtns.forEach(b => b.classList.remove('active'));
        // Add active to clicked
        btn.classList.add('active');
        // Update hidden input
        roleInput.value = btn.dataset.value;
      });
    });

    attachValidation(register, 'register');
    register.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const payload = Object.fromEntries(new FormData(register));
      const valid = [...register.querySelectorAll('input')].every((i) => validateInput(i, 'register'));
      if (!valid) { msg.textContent = 'Periksa kembali data pendaftaran.'; msg.classList.add('error'); return; }
      
      msg.textContent = 'Mendaftar...'; msg.classList.remove('error');
      try {
        const res = await API.apiPost('/api/auth/register', payload);
        State.setPendingEmail(payload.email);
        msg.textContent = `Registrasi sukses. Silakan verifikasi OTP yang dikirim ke ${payload.email}.`;
        window.location.hash = '#/verify';
      } catch (e) {
        msg.textContent = e.message; msg.classList.add('error');
      }
    });
  }
}
