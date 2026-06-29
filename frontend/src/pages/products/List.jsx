import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'

const CATEGORY_OPTIONS = ['Semua', 'Pakaian Pria', 'Pakaian Wanita', 'Elektronik', 'Rumah & Hobi', 'Kesehatan', 'Otomotif']

function Products({ addToCart }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || 'Semua'
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [activeCategory, setActiveCategory] = useState(initialCategory)

  const fetchProducts = useCallback(async (query = '', category = activeCategory) => {
    try {
      setLoading(true)
      const params = {}

      if (category && category !== 'Semua') {
        params.category = category
      } else if (query) {
        params.search = query
      }

      const res = await api.get('/products', { params })
      let items = Array.isArray(res.data) ? res.data : []

      if (category && category !== 'Semua' && query) {
        const needle = query.toLowerCase()
        items = items.filter((item) => String(item.name || '').toLowerCase().includes(needle))
      }

      setProducts(items)
    } catch (error) {
      console.error('Gagal memuat produk:', error)
    } finally {
      setLoading(false)
    }
  }, [activeCategory])

  useEffect(() => {
    setSearchQuery(initialSearch)
    setActiveCategory(initialCategory)
  }, [initialSearch, initialCategory])

  useEffect(() => {
    fetchProducts(searchQuery, activeCategory)
  }, [fetchProducts, searchQuery, activeCategory])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchProducts(searchQuery, activeCategory)
  }

  return (
    <div className="product-layout">
      <div className="actions">
        <div>
          <h2>Produk Terbaru</h2>
          {activeCategory !== 'Semua' && <p className="muted" style={{ margin: '8px 0 0' }}>Kategori aktif: {activeCategory}</p>}
        </div>
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
          <select
            className="input"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            style={{ maxWidth: '180px', background: 'white', border: '1px solid #e2e8f0', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchQuery('')
              setActiveCategory('Semua')
              fetchProducts('', 'Semua')
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
                  <div className="product-category-badge">{product.category || 'Tanpa Kategori'}</div>
                  <h3>{product.name}</h3>
                  <p>{product.description || 'Produk berkualitas pilihan dari Remon Eccom.'}</p>
                  <div className="price">
                    Rp. {Number(product.price || 0).toLocaleString('id-ID')}
                  </div>
                </div>
              </Link>
              <div style={{ padding: '0 24px 24px' }}>
                <button
                  onClick={() => {
                    const needsVariant = Boolean(String(product.sizes || '').trim()) || Boolean(String(product.colors || '').trim())
                    if (needsVariant) {
                      navigate(`/products/${product.id}`)
                      return
                    }
                    addToCart(product, 1)
                  }}
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
