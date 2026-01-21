import { State } from '../../core/state.js';
import { setFieldError } from '../../utils/validator.js';
import { showModal } from '../../components/modal.js';

export function VerifyAccountPage() {
  setTimeout(() => {
    bindEvents();
  }, 0);

  return `
    <div class="panel auth-card">
      <h2 id="auth-title">Verifikasi OTP</h2>
      <p id="auth-subtitle" class="muted" style="margin-bottom: 24px;">Masukkan kode OTP yang dikirim ke email Anda</p>
      <p id="auth-msg" class="muted"></p>

      <form id="form-verify" class="form-vertical">
        <p class="muted">OTP telah dikirim ke <strong id="verify-email-display">-</strong></p>
        <label>OTP
          <div class="input-with-icon">
            <span class="icon">🔢</span>
            <input name="otp" type="text" required inputmode="numeric" placeholder="123456" />
          </div>
          <small class="field-error"></small>
        </label>
        <button class="btn purple full-width" type="submit">Verifikasi</button>
        <div class="auth-footer">
            <a href="#" id="resend-otp">Kirim ulang OTP</a>
            <a href="#/login">Kembali ke Login</a>
        </div>
      </form>
    </div>
  `;
}

function bindEvents() {
  const verify = document.getElementById('form-verify');
  const msg = document.getElementById('auth-msg');
  const verifyEmailDisplay = document.getElementById('verify-email-display');
  const resend = document.getElementById('resend-otp');

  if (verifyEmailDisplay) {
    const pe = State.getPendingEmail();
    verifyEmailDisplay.textContent = pe || '-';
  }

  if (verify) {
    verify.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const otpInput = verify.querySelector('input[name="otp"]');
      const email = State.getPendingEmail();
      let ok = true;
      if (!email) { msg.textContent = 'Email verifikasi tidak ditemukan. Silakan daftar ulang.'; msg.classList.add('error'); return; }
      if (!/^\d{6}$/.test(otpInput.value || '')) { setFieldError(otpInput, 'OTP harus 6 digit'); ok = false; }
      if (!ok) { msg.textContent = 'Periksa OTP Anda.'; msg.classList.add('error'); return; }
      
      msg.textContent = 'Memverifikasi...'; msg.classList.remove('error');
      try {
        await API.apiPost('/api/otp/verify', { email, otp: otpInput.value });
        showModal('Verifikasi berhasil. Silakan masuk.');
        State.clearPendingEmail();
        window.location.hash = '#/login';
      } catch (e) {
        msg.textContent = e.message; msg.classList.add('error');
      }
    });
  }

  if (resend) {
    resend.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = State.getPendingEmail() || '';
      if (!/.+@.+\..+/.test(email)) { msg.textContent = 'Email verifikasi tidak valid atau tidak tersedia.'; msg.classList.add('error'); return; }
      
      msg.textContent = 'Mengirim ulang OTP...'; msg.classList.remove('error');
      try {
        await API.apiPost('/api/otp/resend', { email });
        showModal('OTP dikirim ulang ke email Anda.');
      } catch (e2) {
        msg.textContent = e2.message; msg.classList.add('error');
      }
    });
  }
}
