import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

function VerifyAccount() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await api.post('/otp/verify', { email, otp })
      setMessage('Verifikasi berhasil! Silakan login.')
      setMessageType('success')

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Verifikasi gagal. Silakan coba lagi.'
      setMessage(errorMsg)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setMessage('Masukkan email terlebih dahulu')
      setMessageType('error')
      return
    }

    try {
      await api.post('/otp/resend', { email })
      setMessage('OTP telah dikirim ulang!')
      setMessageType('success')
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Gagal mengirim ulang OTP'
      setMessage(errorMsg)
      setMessageType('error')
    }
  }

  return (
    <div className="card">
      <h2>Verifikasi Akun</h2>
      {message && (
        <div className={`alert alert-${messageType}`}>{message}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Loading...' : 'Verifikasi'}
        </button>
      </form>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleResend} className="btn btn-secondary" style={{ width: '100%' }}>
          Kirim Ulang OTP
        </button>
      </div>
      <p className="text-center" style={{ marginTop: '1rem' }}>
        Sudah verifikasi? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}

export default VerifyAccount
