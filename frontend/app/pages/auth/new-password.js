import { State } from '../../core/state.js';
import { showModal } from '../../components/modal.js';

export function NewPasswordPage() {
  setTimeout(() => {
    bindEvents();
  }, 0);

  return `
    <div class="panel auth-card">
      <h2 id="auth-title">Buat Password Baru</h2>
      <p id="auth-subtitle" class="muted auth-subtitle auth-hidden"></p>
      <p id="auth-msg" class="muted"></p>

      <form id="form-new-password" class="form-vertical auth-form-new-password">
        <label>Password Baru
          <div class="input-with-icon">
            <span class="icon">🔒</span>
            <input name="newPassword" type="password" required minlength="8" placeholder="Minimal 8 karakter" />
          </div>
        </label>
        <label class="form-group-confirm">Konfirmasi Password Baru
          <div class="input-with-icon">
            <span class="icon">🔒</span>
            <input name="confirmNewPassword" type="password" required minlength="8" placeholder="Ulangi password baru" />
          </div>
        </label>
        <button class="btn purple full-width btn-submit" type="submit">Simpan Password</button>
        <div class="auth-footer">
           <a href="#/login">Kembali ke Login</a>
        </div>
      </form>
    </div>
  `;
}

function bindEvents() {
  const newPasswordForm = document.getElementById('form-new-password');
  const msg = document.getElementById('auth-msg');

  if (newPasswordForm) {
    newPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPwd = newPasswordForm.querySelector('input[name="newPassword"]').value;
      const confirmPwd = newPasswordForm.querySelector('input[name="confirmNewPassword"]').value;
      
      if (newPwd.length < 8) {
         msg.textContent = 'Password minimal 8 karakter'; msg.classList.add('error'); return;
      }
      if (newPwd !== confirmPwd) {
         msg.textContent = 'Konfirmasi password tidak cocok'; msg.classList.add('error'); return;
      }

      msg.textContent = 'Mereset password...'; msg.classList.remove('error');
      try {
        const email = State.getPendingEmail();
        const otp = State.getPendingOTP();
        if (!email || !otp) throw new Error('Sesi kadaluarsa, silakan ulang dari awal.');
        
        await API.apiPost('/api/auth/reset-password', { email, otp, newPassword: newPwd });
        showModal('Password berhasil direset. Silakan login dengan password baru.');
        State.clearPendingEmail();
        State.clearPendingOTP();
        window.location.hash = '#/login';
      } catch (err) {
         msg.textContent = err.message || 'Gagal mereset password'; msg.classList.add('error');
      }
    });
  }
}
