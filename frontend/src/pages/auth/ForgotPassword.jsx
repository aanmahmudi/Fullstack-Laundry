import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await api.post('/auth/forgot-password', { email })
      setMessage('OTP reset password telah dikirim ke email Anda!')
      setMessageType('success')

      setTimeout(() => {
        navigate('/verify-reset')
      }, 2000)
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Gagal mengirim OTP. Silakan coba lagi.'
      setMessage(errorMsg)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Lupa Password</h2>
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
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Loading...' : 'Kirim OTP'}
        </button>
      </form>
      <p className="text-center" style={{ marginTop: '1rem' }}>
        Sudah ingat password? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}

export default ForgotPassword
