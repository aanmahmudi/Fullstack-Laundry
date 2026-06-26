import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

function ProductDetail({ addToCart }) {
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()

  useEffect(() => {
    fetchProduct()
  }, [id])

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

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return `/uploads/${product.images[0].filename}`
    }
    return 'https://via.placeholder.com/400x300?text=No+Image'
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!product) {
    return <div>Produk tidak ditemukan</div>
  }

  return (
    <div className="card" style={{ maxWidth: '800px' }}>
      <Link to="/products">← Kembali ke Daftar Produk</Link>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <img
          src={getProductImage(product)}
          alt={product.name}
          style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
        />
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h2>{product.name}</h2>
          <p style={{ color: '#666', margin: '1rem 0' }}>
            {product.description}
          </p>
          <h3 style={{ color: '#667eea', marginBottom: '1.5rem' }}>
            Rp {product.price.toLocaleString('id-ID')}
          </h3>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Jumlah</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <button
            onClick={() => addToCart(product, quantity)}
            className="btn btn-primary"
          >
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
