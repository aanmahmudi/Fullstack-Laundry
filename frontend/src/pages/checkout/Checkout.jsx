import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

function Checkout({ cart, clearCart, user }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const navigate = useNavigate()

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Create transactions array
      const transactions = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }))

      const res = await api.post('/transactions', {
        transactions,
        paymentMethod,
      })

      setMessage('Pesanan berhasil dibuat!')
      setMessageType('success')
      clearCart()

      setTimeout(() => {
        navigate('/orders')
      }, 2000)
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Gagal membuat pesanan. Silakan coba lagi.'
      setMessage(errorMsg)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2>Checkout</h2>
      {message && (
        <div className={`alert alert-${messageType}`}>{message}</div>
      )}
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: '1rem' }}>Ringkasan Pesanan</h3>
        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>{item.name} x {item.quantity}</span>
            <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
          </div>
        ))}
        <hr style={{ margin: '1rem 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          <span>Total:</span>
          <span>Rp {total.toLocaleString('id-ID')}</span>
        </div>

        <div className="form-group">
          <label>Metode Pembayaran</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="COD">COD</option>
            <option value="TRANSFER">Transfer Bank</option>
            <option value="CREDIT_CARD">Kartu Kredit</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Loading...' : 'Buat Pesanan'}
        </button>
      </form>
    </div>
  )
}

export default Checkout
