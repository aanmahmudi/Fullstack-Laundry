import { State } from '../core/state.js';
import { showModal } from '../components/modal.js';

export function AuthPage() {
  const user = State.getUser();
  const html = `
    <section>
      <h2>Akun</h2>
      ${user ? loggedIn(user) : authForms()}
    </section>
  `;

  window.__bindPage = () => {
    const login = document.getElementById('form-login');
    const register = document.getElementById('form-register');
    const verify = document.getElementById('form-verify');
    const switchToRegister = document.getElementById('switch-register');
    const switchToLogin = document.getElementById('switch-login');
    const switchToVerify = document.getElementById('switch-verify');
    const msg = document.getElementById('auth-msg');
    const forgot = document.getElementById('forgot-password');
    const verifyEmailDisplay = document.getElementById('verify-email-display');

    function setFieldError(input, message) {
      const label = input.closest('label');
      const err = label ? label.querySelector('.field-error') : null;
      if (err) err.textContent = message || '';
      const wrap = input.closest('.input-with-icon');
      if (wrap) wrap.classList.toggle('input-error', !!message);
      if (label) label.classList.toggle('has-error', !!message);
    }

    function validateInput(input, context) {
      const name = input.name;
      const val = (input.value || '').trim();
      let message = '';
      if (name === 'email') {
        const ok = /.+@.+\..+/.test(val);
        if (!ok) message = 'Format email tidak valid';
      } else if (name === 'password') {
        if ((val || '').length < 8) message = 'Password minimal 8 karakter';
      } else if (name === 'phoneNumber') {
        const ok = /^\d{12,13}$/.test(val);
        if (!ok) message = 'Nomor HP harus 12–13 digit angka';
      } else if (name === 'dateOfBirth' && context === 'register') {
        if (!val) message = 'Tanggal lahir wajib diisi';
      }
      setFieldError(input, message);
      return !message;
    }

    function attachValidation(form, context) {
      if (!form) return;
      const inputs = form.querySelectorAll('input');
      inputs.forEach((i) => {
        i.addEventListener('input', () => validateInput(i, context));
        i.addEventListener('blur', () => validateInput(i, context));
      });
    }

    if (switchToRegister && switchToLogin) {
      switchToRegister.addEventListener('click', (e) => { e.preventDefault(); toggleForms('register'); });
      switchToLogin.addEventListener('click', (e) => { e.preventDefault(); toggleForms('login'); });
    }
    if (switchToVerify) {
      switchToVerify.addEventListener('click', (e) => { e.preventDefault(); toggleForms('verify'); });
    }

  function toggleForms(which) {
    document.getElementById('form-login').style.display = which === 'login' ? 'block' : 'none';
    document.getElementById('form-register').style.display = which === 'register' ? 'block' : 'none';
    if (document.getElementById('form-verify')) {
      document.getElementById('form-verify').style.display = which === 'verify' ? 'block' : 'none';
    }
      const tLogin = document.getElementById('switch-login');
      const tRegister = document.getElementById('switch-register');
      const tVerify = document.getElementById('switch-verify');
      if (tLogin && tRegister) {
        tLogin.classList.toggle('active', which === 'login');
        tRegister.classList.toggle('active', which === 'register');
      }
    if (tVerify) {
      tVerify.classList.toggle('active', which === 'verify');
    }
    if (which === 'verify' && verifyEmailDisplay) {
      const pe = State.getPendingEmail();
      verifyEmailDisplay.textContent = pe || '-';
    }
    msg.textContent = '';
    msg.classList.remove('error');
  }

    if (login) {
      attachValidation(login, 'login');
      login.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const payload = Object.fromEntries(new FormData(login));
        const valid = [...login.querySelectorAll('input')].every((i) => validateInput(i, 'login'));
        if (!valid) { msg.textContent = 'Periksa kembali input Anda.'; msg.classList.add('error'); return; }
        msg.textContent = 'Mengirim...'; msg.classList.remove('error');
        try {
          const res = await API.apiPost('/api/customers/login', payload);
          const token = res.token || res.accessToken || null;
          const id = res.customerId || res.id || null;
          State.setUser({ email: payload.email, id, token });
          window.location.hash = '#/auth';
        } catch (e) {
          msg.textContent = e.message; msg.classList.add('error');
        }
      });
    }
    if (forgot) {
      forgot.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('Jika lupa password, silakan hubungi admin atau gunakan fitur reset jika tersedia.');
      });
    }
    if (verify) {
      const resend = document.getElementById('resend-otp');
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
          toggleForms('login');
        } catch (e) {
          msg.textContent = e.message; msg.classList.add('error');
        }
      });
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
    if (register) {
      attachValidation(register, 'register');
      register.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const payload = Object.fromEntries(new FormData(register));
        const valid = [...register.querySelectorAll('input')].every((i) => validateInput(i, 'register'));
        if (!valid) { msg.textContent = 'Periksa kembali data pendaftaran.'; msg.classList.add('error'); return; }
        msg.textContent = 'Mendaftar...'; msg.classList.remove('error');
        try {
          const res = await API.apiPost('/api/customers/register', payload);
          State.setPendingEmail(payload.email);
          msg.textContent = `Registrasi sukses. Silakan verifikasi OTP yang dikirim ke ${payload.email}.`;
          toggleForms('verify');
        } catch (e) {
          msg.textContent = e.message; msg.classList.add('error');
        }
      });
    }
    const logout = document.getElementById('btn-logout');
    if (logout) {
      logout.addEventListener('click', async () => {
        const u = State.getUser();
        try {
          if (u?.email) { await API.apiPost('/api/customers/logout', { email: u.email }); }
        } catch (_) { /* abaikan error logout server */ }
        State.clearUser();
        window.location.hash = '#/auth';
      });
    }
    const formUpdate = document.getElementById('form-update-password');
    const btnUpdate = document.getElementById('btn-update-password');
    const updMsg = document.getElementById('upd-msg');
    if (formUpdate && btnUpdate) {
      attachValidation(formUpdate, 'update');
      btnUpdate.addEventListener('click', async () => {
        const oldPwd = formUpdate.querySelector('input[name="oldPassword"]');
        const newPwd = formUpdate.querySelector('input[name="newPassword"]');
        const cnfPwd = formUpdate.querySelector('input[name="confirmNewPassword"]');
        let ok = true;
        if ((oldPwd.value || '').length < 8) { setFieldError(oldPwd, 'Password minimal 8 karakter'); ok = false; }
        if ((newPwd.value || '').length < 8) { setFieldError(newPwd, 'Password minimal 8 karakter'); ok = false; }
        if ((cnfPwd.value || '') !== (newPwd.value || '')) { setFieldError(cnfPwd, 'Konfirmasi password tidak cocok'); ok = false; }
        if (!ok) { updMsg.textContent = 'Periksa input Anda.'; updMsg.classList.add('error'); return; }
        updMsg.textContent = 'Menyimpan...'; updMsg.classList.remove('error');
        try {
          const payload = Object.fromEntries(new FormData(formUpdate));
          const u = State.getUser();
          await API.apiPost('/api/customers/update-password', { email: u?.email, ...payload });
          showModal('Password berhasil diubah.');
          formUpdate.reset();
        } catch (e) {
          updMsg.textContent = e.message; updMsg.classList.add('error');
        }
      });
    }
  };

  return html;
}

function authForms() {
  return `
    <div class="panel auth-card">
      <div class="tabs">
        <a href="#" id="switch-login" class="tab active">Masuk</a>
        <a href="#" id="switch-register" class="tab">Daftar</a>
        <a href="#" id="switch-verify" class="tab">Verifikasi</a>
      </div>
      <p id="auth-msg" class="muted"></p>

      <form id="form-login" class="form-vertical" style="display:block">
        <label>Email
          <div class="input-with-icon">
            <span class="icon">@</span>
            <input name="email" type="email" required placeholder="email@contoh.com" />
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
        <button class="btn primary" type="submit">Masuk</button>
        <a href="#" id="forgot-password" class="muted">Lupa Password?</a>
      </form>

      <form id="form-register" class="form-vertical" style="display:none">
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
        <button class="btn primary" type="submit">Daftar</button>
      </form>

      <form id="form-verify" class="form-vertical" style="display:none">
        <p class="muted">OTP telah dikirim ke <strong id="verify-email-display">-</strong></p>
        <label>OTP
          <div class="input-with-icon">
            <span class="icon">🔢</span>
            <input name="otp" type="text" required inputmode="numeric" placeholder="123456" />
          </div>
          <small class="field-error"></small>
        </label>
        <button class="btn primary" type="submit">Verifikasi</button>
        <a href="#" id="resend-otp" class="muted">Kirim ulang OTP</a>
      </form>
    </div>
  `;
}

function loggedIn(user) {
  return `
    <div class="panel auth-card profile-card">
      <p>Masuk sebagai <strong>${user.email}</strong></p>
      <button id="btn-logout" class="btn danger">Keluar</button>
    </div>
    <div class="panel auth-card" id="form-update-password">
      <div class="tabs"><span class="tab active">Ubah Password</span></div>
      <div class="form-vertical">
        <label>Password Lama
          <div class="input-with-icon">
            <span class="icon">🔒</span>
            <input name="oldPassword" type="password" required placeholder="••••••••" minlength="8" />
          </div>
          <small class="field-error"></small>
        </label>
        <label>Password Baru
          <div class="input-with-icon">
            <span class="icon">🔒</span>
            <input name="newPassword" type="password" required placeholder="Minimal 8 karakter" minlength="8" />
          </div>
          <small class="field-error"></small>
        </label>
        <label>Konfirmasi Password Baru
          <div class="input-with-icon">
            <span class="icon">🔒</span>
            <input name="confirmNewPassword" type="password" required placeholder="Ulangi password baru" minlength="8" />
          </div>
          <small class="field-error"></small>
        </label>
        <button class="btn primary" id="btn-update-password" type="button">Simpan</button>
        <p id="upd-msg" class="muted"></p>
      </div>
    </div>
  `;
}