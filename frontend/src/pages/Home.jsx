import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const categories = ['Pakaian Pria', 'Pakaian Wanita', 'Elektronik', 'Rumah & Hobi', 'Kesehatan', 'Otomotif']

  return (
    <div className="home-container">
      <section className="banner-section banner-only">
        <div className="main-banner">
          <div className="main-banner-content">
            <h1>Belanja Hemat di Remon Eccom</h1>
            <p>Temukan produk terbaik dengan harga bersahabat setiap hari</p>
            <Link to="/products" className="btn main-banner-cta">
              Belanja Sekarang
            </Link>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <h3>Kategori Pilihan</h3>
        <div className="categories-scroll">
          {categories.map((cat, idx) => (
            <div key={idx} className="category-item" role="button" tabIndex={0}>
              <div className="category-icon">
                📦
              </div>
              <div className="category-label">{cat}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: 'center', padding: '40px 0', background: 'none', border: 'none', boxShadow: 'none' }}>
        <p style={{ color: '#666', marginBottom: '20px' }}>Temukan ribuan produk menarik lainnya di Remon Eccom</p>
        <Link to="/products" className="btn primary" style={{ padding: '12px 40px', fontSize: '1.1rem' }}>
          Mulai Belanja
        </Link>
      </section>
    </div>
  )
}

export default Home
