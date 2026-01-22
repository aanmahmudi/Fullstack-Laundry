import { State } from '../../core/state.js';
import { validateInput, attachValidation } from '../../utils/validator.js';
import { ICONS } from '../../utils/icons.js';

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
            <button type="button" class="password-toggle" title="Lihat Password">${ICONS.eye}</button>
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
    // Setup password toggles
    login.querySelectorAll('.password-toggle').forEach(btn => {
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
        const username = res.username || null;
        const role = res.role || null;
        
        State.setUser({ 
          email: res.email || payload.email, 
          id, 
          username, 
          role,
          token 
        });
        
        window.location.hash = '#/dashboard';
      } catch (e) {
        let errorMsg = e.message;
        // Parsing JSON string if api.js fails to parse it
        try {
          if (errorMsg.startsWith('{')) {
             const parsed = JSON.parse(errorMsg);
             if (parsed.message) errorMsg = parsed.message;
          }
        } catch {}

        // User friendly messages
        if (errorMsg.includes('Login failed: ')) {
           errorMsg = errorMsg.replace('Login failed: ', '');
        }

        if (errorMsg.toLowerCase().includes('customer not found') || errorMsg.toLowerCase().includes('user not found')) {
           errorMsg = 'Username atau Email tidak terdaftar.';
        } else if (errorMsg.toLowerCase().includes('invalid email or password') || errorMsg.toLowerCase().includes('password mismatch')) {
           errorMsg = 'Password yang Anda masukkan salah.';
        } else if (errorMsg.toLowerCase().includes('account not verified')) {
           errorMsg = 'Akun belum diverifikasi. Silakan cek email Anda.';
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
