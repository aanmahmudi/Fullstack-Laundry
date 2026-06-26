import React from 'react'
import { Link } from 'react-router-dom'

function Cart({ cart, updateQuantity, removeFromCart }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Keranjang Belanja</h2>
        <p>Keranjang Anda kosong</p>
        <Link to="/products" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Belanja Sekarang
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2>Keranjang Belanja</h2>
      {cart.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            borderBottom: '1px solid #eee',
          }}
        >
          <div style={{ flex: 1 }}>
            <h4>{item.name}</h4>
            <p style={{ color: '#667eea', fontWeight: 'bold' }}>
              Rp {item.price.toLocaleString('id-ID')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
              -
            </button>
            <span style={{ minWidth: '30px', textAlign: 'center' }}>
              {item.quantity}
            </span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
              +
            </button>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            style={{ background: '#ff4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            Hapus
          </button>
        </div>
      ))}
      <div style={{ textAlign: 'right', padding: '1rem 0' }}>
        <h3>Total: Rp {total.toLocaleString('id-ID')}</h3>
        <Link to="/checkout" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>
          Checkout Sekarang
        </Link>
      </div>
    </div>
  )
}

export default Cart
