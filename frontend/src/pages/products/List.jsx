import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function Products({ addToCart }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data || [])
    } catch (error) {
      setMessage('Gagal memuat produk')
    } finally {
      setLoading(false)
    }
  }

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return `/uploads/${product.images[0].filename}`
    }
    return 'https://via.placeholder.com/250x200?text=No+Image'
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div>
      <h2>Daftar Produk</h2>
      {message && <div className="alert alert-error">{message}</div>}
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="product-image"
            />
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {product.description}
              </p>
              <p className="product-price">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link
                  to={`/products/${product.id}`}
                  className="btn btn-secondary"
                  style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
                >
                  Detail
                </Link>
                <button
                  onClick={() => addToCart(product)}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  + Keranjang
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products
