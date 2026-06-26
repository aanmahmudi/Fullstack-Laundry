import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function Orders({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/customers/${user.customerId}/transactions`)
      setOrders(res.data || [])
    } catch (error) {
      setMessage('Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Pesanan Anda</h2>
        <p>Belum ada pesanan</p>
        <Link to="/products" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Belanja Sekarang
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2>Pesanan Anda</h2>
      {message && <div className="alert alert-error">{message}</div>}
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {orders.map((order) => (
          <div key={order.id} className="product-card" style={{ padding: '1rem' }}>
            <h3>Pesanan #{order.id}</h3>
            <p>Tanggal: {new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
            <p>Status: <strong>{order.status}</strong></p>
            <p>Total: Rp {order.total.toLocaleString('id-ID')}</p>
            <Link to={`/orders/${order.id}`} className="btn btn-primary" style={{ display: 'inline-block', marginTop: '0.5rem', textDecoration: 'none' }}>
              Lihat Detail
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
