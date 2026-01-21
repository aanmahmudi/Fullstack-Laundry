import { State } from '../../core/state.js';

export function ForgotPasswordPage() {
  setTimeout(() => {
    bindEvents();
  }, 0);

  return `
    <div class="panel auth-card">
      <h2 id="auth-title">Lupa Password</h2>
      <p id="auth-subtitle" class="muted" style="margin-bottom: 24px;">Masukkan email untuk reset password</p>
      <p id="auth-msg" class="muted"></p>

      <form id="form-forgot" class="form-vertical">
        <label>Email
          <div class="input-with-icon">
            <span class="icon">@</span>
            <input name="email" type="email" required placeholder="email@contoh.com" />
          </div>
          <small class="field-error"></small>
        </label>
        <button class="btn purple full-width" type="submit">Kirim OTP Reset</button>
        <div class="auth-footer">
           <a href="#/login">Kembali ke Login</a>
        </div>
      </form>
    </div>
  `;
}

function bindEvents() {
  const forgotForm = document.getElementById('form-forgot');
  const msg = document.getElementById('auth-msg');

  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = forgotForm.querySelector('input[name="email"]').value;
      if (!email) return;
      
      msg.textContent = 'Mengirim OTP...'; msg.classList.remove('error');
      try {
        await API.apiPost('/api/auth/forgot-password', { email });
        State.setPendingEmail(email);
        window.location.hash = '#/verify-reset-otp';
      } catch (err) {
        msg.textContent = err.message || 'Gagal mengirim OTP'; msg.classList.add('error');
      }
    });
  }
}
