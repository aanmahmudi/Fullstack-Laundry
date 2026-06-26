import React from 'react'
import { Link } from 'react-router-dom'

function Header({ user, logout, cartCount }) {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          🧺 Laundry App
        </Link>
        <nav className="nav">
          <Link to="/products" className="nav-link">
            Produk
          </Link>
          <Link to="/cart" className="nav-link cart-link">
            Keranjang
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/orders" className="nav-link">
                Pesanan
              </Link>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
