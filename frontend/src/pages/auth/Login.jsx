import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

function Login({ setUser }) {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await api.post('/auth/login', formData)
      const { token, customerId, username, email, role, success } = res.data

      if (success) {
        const userData = { customerId, username, email, role }
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
    <div className="card">
      <h2>Login</h2>
      {message && (
        <div className={`alert alert-${messageType}`}>{message}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      <p className="text-center" style={{ marginTop: '1rem' }}>
        Belum punya akun? <Link to="/register">Register</Link>
      </p>
      <p className="text-center">
        Lupa password? <Link to="/forgot-password">Reset Password</Link>
      </p>
    </div>
  )
}

export default Login
