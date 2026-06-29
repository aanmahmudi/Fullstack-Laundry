import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

function Checkout({ cart, clearCart, user }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [formData, setFormData] = useState({
    shippingAddress: '',
    paymentMethod: 'COD',
    notes: '',
  })
  const navigate = useNavigate()

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  const variantMissing = useMemo(() => {
    return cart.some((item) => {
      const needSize = Boolean(String(item.sizes || '').trim())
      const needColor = Boolean(String(item.colors || '').trim())
      if (needSize && !item.selectedSize) return true
      if (needColor && !item.selectedColor) return true
      return false
    })
  }, [cart])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    if (variantMissing) {
      setMessage('Pilih variasi yang tersedia untuk semua produk di keranjang sebelum checkout.')
      setMessageType('error')
      return
    }
    setLoading(true)
    setMessage('')

    try {
      // Create transactions one by one (since backend expects single product per transaction)
      for (const item of cart) {
        await api.post('/transactions', {
          customerId: user.customerId,
          productId: item.id,
          quantity: item.quantity,
          shippingAddress: formData.shippingAddress,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
        })
      }
      
      setMessage('Pesanan berhasil dibuat!')
      setMessageType('success')
      clearCart()

      setTimeout(() => {
        navigate('/orders')
      }, 1200)
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Gagal membuat pesanan. Silakan coba lagi.'
      setMessage(errorMsg)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <div>
          <h2>Checkout</h2>
          <p className="muted" style={{ margin: '8px 0 0' }}>Pastikan alamat benar sebelum membuat pesanan.</p>
        </div>
        <Link to="/cart" className="btn">
          Kembali ke Keranjang
        </Link>
      </div>

      {message && (
        <div className={`msg ${messageType} visible`} style={{ display: 'block' }}>
          <div className="alert-content">
            <span className="icon">{messageType === 'success' ? '✅' : '❌'}</span>
            <span>{message}</span>
          </div>
        </div>
      )}

      <div className="checkout-grid">
        <section className="checkout-form-card">
          <h3>Pengiriman & Pembayaran</h3>
          <form onSubmit={handleSubmit} className="checkout-form">
            <label className="checkout-field">
              <span>Alamat Pengiriman</span>
              <textarea
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                required
                rows={3}
              />
            </label>

            <label className="checkout-field">
              <span>Metode Pembayaran</span>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="COD">COD</option>
                <option value="TRANSFER">Transfer Bank</option>
                <option value="CREDIT_CARD">Kartu Kredit</option>
              </select>
            </label>

            <label className="checkout-field">
              <span>Catatan (opsional)</span>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </label>

            <button type="submit" className="btn primary checkout-submit" disabled={loading || cart.length === 0}>
              {loading ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </form>
        </section>

        <section className="checkout-summary-card">
          <h3>Ringkasan Pesanan</h3>
          <div className="checkout-items">
            {cart.map((item) => (
              <div key={item.cartKey || item.id} className="checkout-item-row">
                <div>
                  <div className="checkout-item-name">{item.name}</div>
                  {(item.selectedSize || item.selectedColor) && (
                    <div className="checkout-item-meta">
                      {item.selectedSize ? `${(item.variant1Name || 'Variasi 1')}: ${item.selectedSize}` : ''}
                      {item.selectedSize && item.selectedColor ? ' • ' : ''}
                      {item.selectedColor ? `${(item.variant2Name || 'Variasi 2')}: ${item.selectedColor}` : ''}
                    </div>
                  )}
                  <div className="checkout-item-qty">x{item.quantity}</div>
                </div>
                <strong>Rp. {(Number(item.price) * item.quantity).toLocaleString('id-ID')}</strong>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <strong>Rp. {total.toLocaleString('id-ID')}</strong>
          </div>
          {variantMissing && (
            <div className="checkout-warning">
              Pilih variasi di halaman detail produk dulu untuk semua item.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Checkout
