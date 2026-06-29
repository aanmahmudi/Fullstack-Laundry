import React from 'react'
import { Link } from 'react-router-dom'

function Cart({ cart, updateQuantity, removeFromCart }) {
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Keranjang Belanja</h2>
        <p>Keranjang Anda kosong</p>
        <Link to="/products" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
          Belanja Sekarang
        </Link>
      </div>
    )
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Keranjang Belanja</h2>
        <Link to="/products" className="btn">
          Tambah Produk
        </Link>
      </div>
      {cart.map((item) => (
        <div key={item.cartKey || `${item.id}|${item.selectedSize || ''}|${item.selectedColor || ''}`} className="cart-item">
          <div className="cart-item-info">
            <div className="cart-item-name">{item.name}</div>
            {(item.selectedSize || item.selectedColor) && (
              <div className="cart-item-variant">
                {item.selectedSize ? `${(item.variant1Name || 'Variasi 1')}: ${item.selectedSize}` : ''}
                {item.selectedSize && item.selectedColor ? ' • ' : ''}
                {item.selectedColor ? `${(item.variant2Name || 'Variasi 2')}: ${item.selectedColor}` : ''}
              </div>
            )}
            <div className="cart-item-price">
              Rp. {Number(item.price).toLocaleString('id-ID')}
            </div>
          </div>
          <div className="cart-item-controls">
            <button
              className="quantity-btn"
              onClick={() => updateQuantity(item.cartKey || `${item.id}|${item.selectedSize || ''}|${item.selectedColor || ''}`, item.quantity - 1)}
            >
              -
            </button>
            <span className="quantity-value">{item.quantity}</span>
            <button
              className="quantity-btn"
              onClick={() => updateQuantity(item.cartKey || `${item.id}|${item.selectedSize || ''}|${item.selectedColor || ''}`, item.quantity + 1)}
            >
              +
            </button>
          </div>
          <div style={{ minWidth: '100px', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>
            Rp. { (Number(item.price) * item.quantity).toLocaleString('id-ID') }
          </div>
          <button onClick={() => removeFromCart(item.cartKey || `${item.id}|${item.selectedSize || ''}|${item.selectedColor || ''}`)} className="remove-btn">
            Hapus
          </button>
        </div>
      ))}
      <div className="cart-summary">
        <h3>Ringkasan Pesanan</h3>
        <div className="total-price">
          Total: Rp. {total.toLocaleString('id-ID')}
        </div>
        <Link to="/checkout" className="btn btn-primary" style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
          Lanjut ke Checkout
        </Link>
      </div>
    </div>
  )
}

export default Cart
