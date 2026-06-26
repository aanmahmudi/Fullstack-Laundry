import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Header({ user, logout, cartCount }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="brand">
          <span>Remon</span>
          <span>Eccom</span>
        </Link>

        <div className="header-search">
          <form 
            className="search-form"
            onSubmit={(e) => {
              e.preventDefault()
              const query = e.target.querySelector('input').value
              if (query) {
                navigate(`/products?search=${encodeURIComponent(query)}`)
              } else {
                navigate('/products')
              }
            }}
          >
            <input 
              type="text" 
              placeholder="Cari produk di Remon Eccom..." 
              aria-label="Cari produk"
            />
            <button type="submit">
              <span className="icon">🔍</span>
            </button>
          </form>
        </div>

        <div className="header-actions">
          {user ? (
            <>
              <Link to="/orders" className="nav-link">Transaksi</Link>
              
              <Link to="/cart" className="icon-btn cart-btn" title="Keranjang">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>

              <div className="user-menu-container">
                <div className="user-menu-trigger">
                  <div className="avatar-placeholder">
                    {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info-mini">
                    <span className="user-name">{user.username || user.email}</span>
                  </div>
                </div>

                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.username || user.email.split('@')[0]}</strong>
                    <span className="role-badge">{user.role || 'USER'}</span>
                    {user.role === 'ADMIN' && user.shopName && (
                      <span style={{ display: 'block', marginTop: '6px', color: '#64748b', fontSize: '12px', lineHeight: '1.3' }}>
                        {user.shopName}
                        {user.shopDescription ? ` • ${user.shopDescription}` : ''}
                      </span>
                    )}
                  </div>
                  
                  {user.role === 'ADMIN' ? (
                    <>
                      <Link to="/seller/products" className="dropdown-item">
                        <span className="icon">🏪</span>
                        Kelola Produk
                      </Link>
                      <Link to="/orders" className="dropdown-item">
                        <span className="icon">📦</span>
                        Pesanan Masuk
                      </Link>
                    </>
                  ) : (
                    <Link to="/orders" className="dropdown-item">
                      <span className="icon">📋</span>
                      Riwayat Belanja
                    </Link>
                  )}
                  
                  <div className="dropdown-divider"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="dropdown-item danger"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                  >
                    <span className="icon">🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/register" className="btn-text" style={{ fontWeight: '600' }}>Daftar</Link>
              <div style={{ width: '1px', height: '16px', background: '#ddd' }}></div>
              <Link to="/login" className="btn-text" style={{ fontWeight: '600' }}>Login</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
