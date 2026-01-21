import { State } from '../../core/state.js';
import { validateInput, attachValidation } from '../../utils/validator.js';

export function RegisterPage() {
  setTimeout(() => {
    bindEvents();
  }, 0);

  return `
    <div class="panel auth-card">
      <h2 id="auth-title">Sign Up</h2>
      <p id="auth-subtitle" class="muted" style="margin-bottom: 24px;">Lengkapi data untuk membuat akun baru</p>
      <p id="auth-msg" class="muted"></p>

      <form id="form-register" class="form-vertical">
        <label>Nama
          <div class="input-with-icon">
            <span class="icon">👤</span>
            <input name="username" type="text" required placeholder="Nama lengkap" />
          </div>
          <small class="field-error"></small>
        </label>
        <label>No. HP (12–13 digit)
          <div class="input-with-icon">
            <span class="icon">📱</span>
            <input name="phoneNumber" type="text" required pattern="[0-9]{12,13}" inputmode="numeric" title="Harus 12–13 digit angka" placeholder="081234567890" />
          </div>
          <small class="field-error"></small>
        </label>
        <label>Email
          <div class="input-with-icon">
            <span class="icon">@</span>
            <input name="email" type="email" required placeholder="email@contoh.com" />
          </div>
          <small class="field-error"></small>
        </label>
        <label>Password (min 8)
          <div class="input-with-icon">
            <span class="icon">🔒</span>
            <input name="password" type="password" required minlength="8" placeholder="Minimal 8 karakter" />
            <button type="button" class="password-toggle" title="Lihat Password">👁️</button>
          </div>
          <small class="field-error"></small>
        </label>
        <label>Tempat Lahir
          <div class="input-with-icon">
            <span class="icon">📍</span>
            <input name="placeOfBirth" type="text" placeholder="Kota/Kabupaten" />
          </div>
          <small class="field-error"></small>
        </label>
        <label>Tanggal Lahir
          <input name="dateOfBirth" type="date" required />
          <small class="field-error"></small>
        </label>
        <label>Alamat
          <div class="input-with-icon">
            <span class="icon">🏠</span>
            <input name="address" type="text" placeholder="Alamat lengkap" />
          </div>
          <small class="field-error"></small>
        </label>
        <button class="btn purple full-width" type="submit">Sign Up</button>
        <div class="auth-footer">
           <span>Sudah punya akun? <a href="#/login">Login</a></span>
        </div>
      </form>
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
          btn.textContent = '🙈';
        } else {
          input.type = 'password';
          btn.textContent = '👁️';
        }
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
