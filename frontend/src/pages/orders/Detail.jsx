import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

function OrderDetail() {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/transactions/${id}`)
      setOrder(res.data)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!order) {
    return <div>Pesanan tidak ditemukan</div>
  }

  return (
    <div className="card" style={{ maxWidth: '800px' }}>
      <Link to="/orders">← Kembali ke Daftar Pesanan</Link>
      <h2 style={{ marginTop: '1rem' }}>Detail Pesanan #{order.id}</h2>
      <p>Tanggal: {new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
      <p>Status: <strong>{order.status}</strong></p>
      <hr />
      <h3>Daftar Produk</h3>
      {order.items?.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
          <span>{item.productName} x {item.quantity}</span>
          <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
        </div>
      ))}
      <hr />
      <div style={{ textAlign: 'right', marginTop: '1rem' }}>
        <h3>Total: Rp {order.total.toLocaleString('id-ID')}</h3>
      </div>
    </div>
  )
}

export default OrderDetail
