import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '1rem' }}>Selamat Datang di Laundry App 🧺</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Aplikasi manajemen laundry yang mudah dan cepat!
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          to="/products"
          style={{
            padding: '0.75rem 2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          Lihat Produk
        </Link>
      </div>
    </div>
  )
}

export default Home
