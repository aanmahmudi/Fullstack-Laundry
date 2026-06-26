import React, { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../services/api'

function Products({ addToCart, user }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const [searchQuery, setSearchQuery] = useState(initialSearch)

  const fetchProducts = useCallback(async (query = '') => {
    try {
      setLoading(true)
      let url = '/products'
      if (query) {
        url += `?search=${encodeURIComponent(query)}`
      }
      const res = await api.get(url)
      setProducts(res.data || [])
    } catch (error) {
      console.error('Gagal memuat produk:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts(searchQuery)
  }, [fetchProducts, searchQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchProducts(searchQuery)
  }

  return (
    <div className="product-layout">
      <div className="actions">
        <h2>Produk Terbaru</h2>
        <div style={{ display: 'flex', gap: '10px', flex: '1', maxWidth: '400px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: '1' }}>
            <input
              className="input"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'white', border: '1px solid #e2e8f0', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
            />
            <button type="submit" className="btn" style={{ background: '#1a1a1a', color: 'white' }}>
              Cari
            </button>
          </form>
          <button
            onClick={() => {
              setSearchQuery('')
              fetchProducts('')
            }}
            className="btn"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading" style={{ color: '#333', padding: '40px' }}>Memuat produk...</div>
      ) : products.length === 0 ? (
        <section>
          <p style={{ textAlign: 'center', color: '#666' }}>Tidak ada produk ditemukan.</p>
        </section>
      ) : (
        <div id="products-grid" className="grid">
          {products.map((product) => (
            <article key={product.id} className="card">
              <Link to={`/products/${product.id}`}>
                <figure className="thumb">
                  {product.photoUrl ? (
                    <img
                      src={product.photoUrl}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/f1f5f9/94a3b8?text=No+Image'
                      }}
                    />
                  ) : (
                    <img src="https://via.placeholder.com/400x300/f1f5f9/94a3b8?text=No+Image" alt="No Image" />
                  )}
                </figure>
                <div className="card-body">
                  <h3>{product.name}</h3>
                  <p>{product.description || 'Produk berkualitas pilihan dari Remon Eccom.'}</p>
                  <div className="price">
                    Rp {Number(product.price || 0).toLocaleString('id-ID')}
                  </div>
                </div>
              </Link>
              <div style={{ padding: '0 24px 24px' }}>
                <button
                  onClick={() => addToCart(product, 1)}
                  className="btn primary"
                  style={{ width: '100%' }}
                >
                  Tambah ke Keranjang
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products
