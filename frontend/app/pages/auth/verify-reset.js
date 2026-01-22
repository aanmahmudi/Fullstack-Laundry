import { State } from '../../core/state.js';
import { showModal } from '../../components/modal.js';

export function VerifyResetPage() {
  setTimeout(() => {
    bindEvents();
  }, 0);

  return `
    <div class="panel auth-card">
      <h2 id="auth-title">Verifikasi OTP</h2>
      <p id="auth-subtitle" class="muted" style="margin-bottom: 24px; display: none;"></p>
      <p id="auth-msg" class="muted"></p>

      <form id="form-verify-reset-otp" class="form-vertical">
        <p class="muted">Masukkan OTP yang dikirim ke email Anda.</p>
        <label style="margin-bottom: 24px;">OTP
          <div class="input-with-icon">
            <span class="icon">🔢</span>
            <input name="otp" type="text" required placeholder="Kode OTP" />
          </div>
        </label>
        <button class="btn purple full-width" type="submit">Lanjut</button>
        <div class="auth-footer">
           <a href="#" id="resend-reset-otp">Kirim ulang OTP</a>
           <a href="#/login">Kembali ke Login</a>
        </div>
      </form>
    </div>
  `;
}

function bindEvents() {
  const verifyResetForm = document.getElementById('form-verify-reset-otp');
  const msg = document.getElementById('auth-msg');
  const resendReset = document.getElementById('resend-reset-otp');

  if (verifyResetForm) {
    verifyResetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const otpInput = verifyResetForm.querySelector('input[name="otp"]');
      const otp = (otpInput.value || '').trim();
      if (!otp) { msg.textContent = 'Masukkan OTP'; msg.classList.add('error'); return; }
      
      const email = State.getPendingEmail();
      if (!email) { msg.textContent = 'Sesi kadaluarsa. Silakan mulai ulang.'; msg.classList.add('error'); return; }

      msg.textContent = 'Memverifikasi OTP...'; msg.classList.remove('error');
      try {
         await API.apiPost('/api/otp/verify-reset', { email, otp });
         State.setPendingOTP(otp);
         msg.textContent = '';
         
         // Fix navigation issue
         setTimeout(() => {
            window.location.hash = '#/new-password';
         }, 100);
      } catch (err) {
         msg.textContent = err.message || 'OTP Salah atau Kadaluarsa'; msg.classList.add('error');
      }
    });
  }

  if (resendReset) {
    resendReset.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = State.getPendingEmail();
      if (!email) { msg.textContent = 'Sesi kadaluarsa. Silakan mulai ulang.'; msg.classList.add('error'); return; }
      
      msg.textContent = 'Mengirim ulang OTP...'; msg.classList.remove('error');
      try {
        await API.apiPost('/api/auth/forgot-password', { email });
        showModal('OTP reset password telah dikirim ulang ke email Anda.');
        msg.textContent = '';
      } catch (err) {
        msg.textContent = err.message || 'Gagal mengirim ulang OTP'; msg.classList.add('error');
      }
    });
  }
}
