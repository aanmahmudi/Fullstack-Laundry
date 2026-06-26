import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

function ProductDetail({ addToCart }) {
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        setProduct(res.data)
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return <div className="loading" style={{ color: 'white' }}>Memuat produk...</div>
  }

  if (!product) {
    return (
      <div className="card">
        <p style={{ textAlign: 'center' }}>Produk tidak ditemukan</p>
        <Link to="/products" className="btn" style={{ marginTop: '16px' }}>
          Kembali ke Daftar Produk
        </Link>
      </div>
    )
  }

  return (
    <div className="card" style={{ maxWidth: '900px' }}>
      <Link to="/products" className="back-link">
        ← Kembali ke Daftar Produk
      </Link>
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <figure className="thumb" style={{ height: '400px' }}>
            {product.photoUrl ? (
              <img
                src={product.photoUrl}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400/f1f5f9/94a3b8?text=No+Image'
                }}
              />
            ) : (
              <img
                src="https://via.placeholder.com/400x400/f1f5f9/94a3b8?text=No+Image"
                alt="No Image"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </figure>
        </div>

        <div style={{ flex: '1', minWidth: '300px' }}>
          <h2 style={{ marginBottom: '12px', color: '#1a1a1a' }}>{product.name}</h2>
          <div style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>
            Rp {Number(product.price || 0).toLocaleString('id-ID')}
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '8px', color: '#333' }}>Deskripsi</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              {product.description || 'Produk berkualitas pilihan dari Remon Eccom.'}
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Jumlah</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ padding: '12px 16px', fontSize: '1rem' }}
            />
          </div>

          <button
            onClick={() => addToCart(product, quantity)}
            className="btn primary"
            style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}
          >
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
