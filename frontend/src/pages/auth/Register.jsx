import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EyeSvg = ({ title = 'Lihat password' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12 18.75 19.5 12 19.5 1.5 12 1.5 12z"
    />
    <circle
      cx="12"
      cy="12"
      r="3.25"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <title>{title}</title>
  </svg>
);

const EyeOffSvg = ({ title = 'Sembunyikan password' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3l18 18"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.7 10.7a3.25 3.25 0 004.6 4.6"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.4 6.7C4.2 8.2 2.7 10.2 1.5 12c1.5 3 4.6 7.5 10.5 7.5 1.7 0 3.3-.3 4.7-.9"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 4.9c1-.3 2-.4 3-.4 5.9 0 9 4.5 10.5 7.5-.8 1.6-2.1 3.4-3.9 4.8"
    />
    <title>{title}</title>
  </svg>
);

function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    placeOfBirth: '',
    dateOfBirth: '',
    address: '',
    role: 'USER',
    shopName: '',
    shopDescription: '',
    ktpNumber: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const startCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    let counter = 60;
    setCountdown(counter);
    timerRef.current = setInterval(() => {
      counter -= 1;
      setCountdown(counter);
      if (counter <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 1000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrors({});

    const newErrors = {};
    if (!formData.username) newErrors.username = 'Nama harus diisi';
    if (!formData.email) newErrors.email = 'Email harus diisi';
    else if (!validateEmail(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'No. HP harus diisi';
    else if (!/^\d{10,13}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'No. HP harus 10 sampai 13 digit angka';
    if (!formData.password) newErrors.password = 'Password harus diisi';
    else if (formData.password.length < 8) newErrors.password = 'Password minimal 8 karakter';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Password tidak cocok';
    if (!formData.placeOfBirth) newErrors.placeOfBirth = 'Tempat lahir harus diisi';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Tanggal lahir harus diisi';
    if (!formData.address) newErrors.address = 'Alamat wajib diisi';
    if (!/^\d{16}$/.test(formData.ktpNumber || '')) newErrors.ktpNumber = 'No. KTP harus 16 digit angka';
    if (formData.role === 'ADMIN') {
      if (!formData.shopName) newErrors.shopName = 'Nama toko harus diisi';
      if (!formData.shopDescription) newErrors.shopDescription = 'Deskripsi toko harus diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        placeOfBirth: formData.placeOfBirth,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        role: formData.role,
        shopName: formData.role === 'ADMIN' ? formData.shopName : null,
        shopDescription: formData.role === 'ADMIN' ? formData.shopDescription : null,
        ktpNumber: formData.ktpNumber,
      });

      setMessage(`Registrasi berhasil. OTP dikirim ke ${formData.email}`);
      setMessageType('success');
      startCountdown();
      setStep(2);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.Error ||
        error.response?.data?.error ||
        'Registrasi gagal. Silakan coba lagi.';
      setMessage(errorMsg);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrors({});

    const newErrors = {};
    if (!formData.otp) newErrors.otp = 'OTP harus diisi';
    else if (formData.otp.length !== 6) newErrors.otp = 'OTP harus 6 digit';
    else if (!/^\d+$/.test(formData.otp)) newErrors.otp = 'OTP hanya boleh angka';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await api.post('/otp/verify', { email: formData.email, otp: formData.otp });
      setMessage('Verifikasi OTP berhasil. Akun aktif.');
      setMessageType('success');
      setStep(3);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Kode OTP salah atau kadaluarsa. Silakan coba lagi.';
      setMessage(errorMsg);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    setMessage('');
    try {
      await api.post('/otp/resend', { email: formData.email });
      setMessage(`OTP dikirim ulang ke ${formData.email}`);
      setMessageType('success');
      startCountdown();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Gagal mengirim ulang OTP.';
      setMessage(errorMsg);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setMessage('');
    setMessageType('');
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card register-card">
        <div className="auth-brand">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '26px', letterSpacing: '-0.5px' }}>Remon</span>
            <span style={{ fontWeight: '600', fontSize: '26px', color: 'var(--primary)', marginLeft: '4px' }}>Eccom</span>
          </Link>
        </div>

        <div className="progress-indicator">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Data</span>
          </div>
          <div className="progress-line" style={{ background: step > 1 ? 'var(--primary)' : '#e0e0e0' }}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">OTP</span>
          </div>
          <div className="progress-line" style={{ background: step > 2 ? 'var(--primary)' : '#e0e0e0' }}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Selesai</span>
          </div>
        </div>

        {message && (
          <div className={`msg ${messageType} visible`}>
            <div className="alert-content">
              <span className="icon">{messageType === 'success' ? '✅' : '❌'}</span>
              <span>{message}</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <>
            <h2>Daftar Akun</h2>
            <p className="auth-subtitle">Lengkapi data, lalu verifikasi OTP dari email</p>

            <form onSubmit={handleRegister} className="form-vertical">
              <div className={`input-with-icon ${errors.username ? 'input-error' : ''}`}>
                <span className="icon">👤</span>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={loading}
                />
              </div>
              {errors.username && <div className="field-error" style={{ marginTop: '-8px' }}>{errors.username}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div className={`input-with-icon ${errors.email ? 'input-error' : ''}`}>
                    <span className="icon">📧</span>
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  {errors.email && <div className="field-error" style={{ marginTop: '6px' }}>{errors.email}</div>}
                </div>
                <div>
                  <div className={`input-with-icon ${errors.phoneNumber ? 'input-error' : ''}`}>
                    <span className="icon">📱</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="No. HP (10–13 digit)"
                      value={formData.phoneNumber}
                      maxLength={13}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                        setFormData({ ...formData, phoneNumber: value });
                        setErrors((prev) => {
                          if (!prev.phoneNumber) return prev;
                          if (value.length >= 10) {
                            const { phoneNumber, ...rest } = prev;
                            return rest;
                          }
                          return prev;
                        });
                      }}
                      onBlur={() => {
                        const len = formData.phoneNumber.length;
                        if (len > 0 && len < 10) {
                          setErrors((prev) => ({ ...prev, phoneNumber: 'Minimal 10 digit angka' }));
                        }
                      }}
                      disabled={loading}
                    />
                  </div>
                  {errors.phoneNumber && <div className="field-error" style={{ marginTop: '6px' }}>{errors.phoneNumber}</div>}
                </div>
              </div>

              <div className="role-selector">
                <button
                  type="button"
                  className={`role-btn ${formData.role === 'USER' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'USER' })}
                  disabled={loading}
                >
                  <span>👤</span> Pembeli
                </button>
                <button
                  type="button"
                  className={`role-btn ${formData.role === 'ADMIN' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                  disabled={loading}
                >
                  <span>🏪</span> Penjual
                </button>
              </div>

              {formData.role === 'ADMIN' && (
                <>
                  <div className={`input-with-icon ${errors.shopName ? 'input-error' : ''}`}>
                    <span className="icon">🏪</span>
                    <input
                      type="text"
                      placeholder="Nama Toko"
                      value={formData.shopName}
                      onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  {errors.shopName && <div className="field-error" style={{ marginTop: '-8px' }}>{errors.shopName}</div>}

                  <div className={`input-with-icon ${errors.shopDescription ? 'input-error' : ''}`}>
                    <span className="icon">📝</span>
                    <input
                      type="text"
                      placeholder="Deskripsi Toko"
                      value={formData.shopDescription}
                      onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  {errors.shopDescription && <div className="field-error" style={{ marginTop: '-8px' }}>{errors.shopDescription}</div>}
                </>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div className={`input-with-icon ${errors.placeOfBirth ? 'input-error' : ''}`}>
                    <span className="icon">📍</span>
                    <input
                      type="text"
                      placeholder="Tempat Lahir"
                      value={formData.placeOfBirth}
                      onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  {errors.placeOfBirth && <div className="field-error" style={{ marginTop: '6px' }}>{errors.placeOfBirth}</div>}
                </div>
                <div>
                  <div className={`input-with-icon ${errors.dateOfBirth ? 'input-error' : ''}`}>
                    <span className="icon">📅</span>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  {errors.dateOfBirth && <div className="field-error" style={{ marginTop: '6px' }}>{errors.dateOfBirth}</div>}
                </div>
              </div>

              <div className={`input-with-icon ${errors.ktpNumber ? 'input-error' : ''}`}>
                <span className="icon">🆔</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="No. KTP (16 digit, wajib)"
                  value={formData.ktpNumber}
                  onChange={(e) => setFormData({ ...formData, ktpNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                  disabled={loading}
                />
              </div>
              {errors.ktpNumber && <div className="field-error" style={{ marginTop: '-8px' }}>{errors.ktpNumber}</div>}

              <div className="input-with-icon">
                <span className="icon">🏠</span>
                <input
                  type="text"
                  placeholder="Alamat Lengkap"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={loading}
                />
              </div>
              {errors.address && <div className="field-error" style={{ marginTop: '-8px' }}>{errors.address}</div>}

              <div className={`input-with-icon ${errors.password ? 'input-error' : ''}`}>
                <span className="icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 8 karakter)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}>
                  {showPassword ? <EyeOffSvg /> : <EyeSvg />}
                </button>
              </div>
              {errors.password && <div className="field-error" style={{ marginTop: '-8px' }}>{errors.password}</div>}

              <div className={`input-with-icon ${errors.confirmPassword ? 'input-error' : ''}`}>
                <span className="icon">🔐</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Konfirmasi Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={loading}
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((v) => !v)} aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Lihat konfirmasi password'}>
                  {showConfirmPassword ? <EyeOffSvg /> : <EyeSvg />}
                </button>
              </div>
              {errors.confirmPassword && <div className="field-error" style={{ marginTop: '-8px' }}>{errors.confirmPassword}</div>}

              <button type="submit" className="btn primary full-width" disabled={loading} style={{ marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Sudah punya akun? <Link to="/login">Masuk Sekarang</Link>
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <button onClick={handleBack} className="btn-ghost" style={{ border: 'none', background: 'none', padding: '0', marginBottom: '16px', cursor: 'pointer' }}>
              ← Kembali
            </button>
            <h2>Verifikasi OTP</h2>
            <p className="auth-subtitle">
              Masukkan kode OTP yang dikirim ke <strong>{formData.email}</strong>
            </p>

            <form onSubmit={handleVerifyOTP} className="form-vertical">
              <div className={`input-with-icon ${errors.otp ? 'input-error' : ''}`}>
                <span className="icon">🔐</span>
                <input
                  type="text"
                  placeholder="6 digit OTP"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  disabled={loading}
                />
              </div>
              {errors.otp && <div className="field-error" style={{ marginTop: '-8px' }}>{errors.otp}</div>}

              <button type="submit" className="btn primary full-width" disabled={loading} style={{ marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {loading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
            </form>

            <div className="auth-footer" style={{ marginTop: '16px' }}>
              <p>
                Tidak menerima kode?{' '}
                {countdown > 0 ? (
                  <span style={{ color: '#666', fontWeight: '600' }}>Kirim ulang ({countdown}s)</span>
                ) : (
                  <button onClick={handleResendOTP} className="btn-text" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    Kirim ulang
                  </button>
                )}
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Akun Aktif</h2>
            <p className="auth-subtitle">Verifikasi berhasil. Silakan login untuk mulai berbelanja.</p>
            <button
              type="button"
              className="btn primary full-width"
              onClick={() => navigate('/login')}
              style={{ marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Login Sekarang
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
