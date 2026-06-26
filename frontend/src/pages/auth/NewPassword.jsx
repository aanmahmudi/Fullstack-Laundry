import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../../services/api'

function NewPassword() {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { email, otp } = location.state || {}

  if (!email || !otp) {
    return (
      <div className="card">
        <h2>Buat Password Baru</h2>
        <p>Halaman tidak valid. Silakan ulangi proses reset password.</p>
        <p className="text-center" style={{ marginTop: '1rem' }}>
          <Link to="/forgot-password">Reset Password</Link>
        </p>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Password tidak cocok')
      setMessageType('error')
      setLoading(false)
      return
    }

    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword: formData.newPassword,
      })
      setMessage('Password berhasil diubah! Silakan login.')
      setMessageType('success')

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Gagal mengubah password. Silakan coba lagi.'
      setMessage(errorMsg)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Buat Password Baru</h2>
      {message && (
        <div className={`alert alert-${messageType}`}>{message}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Password Baru</label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Konfirmasi Password Baru</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Loading...' : 'Ubah Password'}
        </button>
      </form>
      <p className="text-center" style={{ marginTop: '1rem' }}>
        <Link to="/login">Login</Link>
      </p>
    </div>
  )
}

export default NewPassword
