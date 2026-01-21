export function setFieldError(input, message) {
  const label = input.closest('label');
  const err = label ? label.querySelector('.field-error') : null;
  if (err) err.textContent = message || '';
  const wrap = input.closest('.input-with-icon');
  if (wrap) wrap.classList.toggle('input-error', !!message);
  if (label) label.classList.toggle('has-error', !!message);
}

export function validateInput(input, context) {
  const name = input.name;
  const val = (input.value || '').trim();
  let message = '';
  if (name === 'email') {
    if (context === 'register') {
         const ok = /.+@.+\..+/.test(val);
         if (!ok) message = 'Format email tidak valid';
    } else {
         if (!val) message = 'Email/Username wajib diisi';
    }
  } else if (name === 'password' || name === 'oldPassword' || name === 'newPassword' || name === 'confirmNewPassword') {
    if (context === 'login') {
       if (!val) message = 'Masukkan password';
    } else {
       if ((val || '').length < 8) message = 'Password minimal 8 karakter';
    }
  } else if (name === 'phoneNumber') {
    const ok = /^\d{12,13}$/.test(val);
    if (!ok) message = 'Nomor HP harus 12–13 digit angka';
  } else if (name === 'dateOfBirth' && context === 'register') {
    if (!val) message = 'Tanggal lahir wajib diisi';
  }
  setFieldError(input, message);
  return !message;
}

export function attachValidation(form, context) {
  if (!form) return;
  const inputs = form.querySelectorAll('input');
  inputs.forEach((i) => {
    i.addEventListener('input', () => validateInput(i, context));
    i.addEventListener('blur', () => validateInput(i, context));
  });
}
