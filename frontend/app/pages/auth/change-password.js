import { State } from '../../core/state.js';
import { ICONS } from '../../utils/icons.js';
import { validateInput, attachValidation } from '../../utils/validator.js';

export function ChangePasswordPage() {
  setTimeout(() => {
    bindEvents();
  }, 0);

  return `
    <div class="panel auth-card">
      <h2 id="auth-title">Ganti Password</h2>
      <p id="auth-subtitle" class="muted">Amankan akun Anda dengan password baru</p>
      <p id="auth-msg" class="muted"></p>

      <form id="form-change-password" class="form-vertical">
        <label>Password Lama
          <div class="input-with-icon">
            <span class="icon">🔑</span>
            <input name="oldPassword" type="password" required placeholder="Password saat ini" />
            <button type="button" class="password-toggle" title="Lihat Password">${ICONS.eye}</button>
          </div>
        </label>
        
        <label>Password Baru
          <div class="input-with-icon">
            <span class="icon">🔒</span>
            <input name="newPassword" type="password" required minlength="8" placeholder="Minimal 8 karakter" />
            <button type="button" class="password-toggle" title="Lihat Password">${ICONS.eye}</button>
          </div>
        </label>

        <label>Konfirmasi Password Baru
          <div class="input-with-icon">
            <span class="icon">🔒</span>
            <input name="confirmNewPassword" type="password" required minlength="8" placeholder="Ulangi password baru" />
            <button type="button" class="password-toggle" title="Lihat Password">${ICONS.eye}</button>
          </div>
        </label>

        <button class="btn purple full-width" type="submit">Simpan Perubahan</button>
        <div class="auth-footer">
           <a href="#/dashboard">Batal</a>
        </div>
      </form>
    </div>
  `;
}

function bindEvents() {
  const form = document.getElementById('form-change-password');
  const msg = document.getElementById('auth-msg');

  if (form) {
    // Setup password toggles
    form.querySelectorAll('.password-toggle').forEach(btn => {
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

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const user = State.getUser();
      if (!user) {
        window.location.hash = '#/login';
        return;
      }

      const payload = Object.fromEntries(new FormData(form));
      
      if (payload.newPassword !== payload.confirmNewPassword) {
        msg.textContent = 'Password baru tidak cocok.';
        msg.classList.add('error');
        return;
      }

      msg.textContent = 'Menyimpan...'; msg.classList.remove('error');
      
      try {
        await API.apiPut('/api/customers/update-password', {
          email: user.email,
          oldPassword: payload.oldPassword,
          newPassword: payload.newPassword
        });
        
        msg.textContent = 'Password berhasil diubah!';
        msg.classList.remove('error');
        msg.classList.add('success');
        form.reset();
        
        setTimeout(() => {
           window.location.hash = '#/dashboard';
        }, 1500);
      } catch (e) {
        let errorMsg = e.message;
        try {
          if (errorMsg.startsWith('{')) {
             const parsed = JSON.parse(errorMsg);
             if (parsed.message) errorMsg = parsed.message;
          }
        } catch {}

        if (errorMsg.includes('User Not Found')) {
           errorMsg = 'User tidak ditemukan.';
        } else if (errorMsg.includes('Old password is incorect')) {
           errorMsg = 'Password lama salah.';
        } else if (errorMsg.includes('An error occured: ')) {
           errorMsg = errorMsg.replace('An error occured: ', '');
        }

        msg.innerHTML = `
          <div class="alert-content">
             <span class="icon">⚠️</span>
             <span>${errorMsg}</span>
          </div>
        `;
        msg.className = 'msg error visible';
      }
    });
  }
}
