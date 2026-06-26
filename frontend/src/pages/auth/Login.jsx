import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

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
)

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
)

function Login({ setUser }) {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await api.post('/auth/login', formData)
      const { token, customerId, username, email, role, success, shopId, shopName, shopDescription } = res.data

      if (success) {
        const userData = { customerId, username, email, role, shopId, shopName, shopDescription }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', token)
        navigate('/')
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Login gagal. Silakan coba lagi.'
      setMessage(errorMsg)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '26px', letterSpacing: '-0.5px' }}>Remon</span>
            <span style={{ fontWeight: '600', fontSize: '26px', color: 'var(--primary)', marginLeft: '4px' }}>Eccom</span>
          </Link>
        </div>

        <h2>Masuk ke Akun</h2>
        <p className="auth-subtitle">Masukkan email dan password untuk melanjutkan</p>

        {message && (
          <div className={`msg ${messageType} visible`}>
            <div className="alert-content">
              <span className="icon">{messageType === 'success' ? '✅' : '❌'}</span>
              <span>{message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-vertical">
          <div className="input-with-icon">
            <span className="icon">📧</span>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="input-with-icon">
            <span className="icon">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
            >
              {showPassword ? <EyeOffSvg /> : <EyeSvg />}
            </button>
          </div>

          <button type="submit" className="btn primary full-width" disabled={loading} style={{ marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {loading ? 'Loading...' : 'Masuk'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Belum punya akun? <Link to="/register">Daftar Sekarang</Link>
          </p>
          <p>
            <Link to="/forgot-password">Lupa Password?</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
