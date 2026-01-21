import { State } from '../../core/state.js';
import { validateInput, attachValidation } from '../../utils/validator.js';

export function LoginPage() {
  setTimeout(() => {
    bindEvents();
  }, 0);

  return `
    <div class="panel auth-card">
      <h2 id="auth-title">Login</h2>
      <p id="auth-subtitle" class="muted" style="margin-bottom: 20px;">Masukkan email/username dan password</p>
      <p id="auth-msg" class="muted"></p>

      <form id="form-login" class="form-vertical">
        <label>Email atau Username
          <div class="input-with-icon">
            <span class="icon">@</span>
            <input name="email" type="text" required placeholder="email@contoh.com" />
          </div>
          <small class="field-error"></small>
        </label>
        <label>Password
          <div class="input-with-icon">
            <span class="icon">🔒</span>
            <input name="password" type="password" required placeholder="••••••••" minlength="8" />
          </div>
          <small class="field-error"></small>
        </label>
        <button class="btn purple full-width" type="submit">Login</button>
        <div class="auth-footer">
           <span>Belum punya akun? <a href="#/register">Create Account</a></span>
           <a href="#/forgot-password">Forgot password?</a>
        </div>
      </form>
    </div>
  `;
}

function bindEvents() {
  const login = document.getElementById('form-login');
  const msg = document.getElementById('auth-msg');

  if (login) {
    attachValidation(login, 'login');
    login.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const payload = Object.fromEntries(new FormData(login));
      const valid = [...login.querySelectorAll('input')].every((i) => validateInput(i, 'login'));
      if (!valid) { msg.textContent = 'Periksa kembali input Anda.'; msg.classList.add('error'); return; }
      
      msg.textContent = 'Mengirim...'; msg.classList.remove('error');
      try {
        const res = await API.apiPost('/api/auth/login', payload);
        const token = res.token || res.accessToken || null;
        const id = res.customerId || res.id || null;
        State.setUser({ email: payload.email, id, token });
        window.location.hash = '#/dashboard';
      } catch (e) {
        msg.textContent = e.message; msg.classList.add('error');
      }
    });
  }
}
