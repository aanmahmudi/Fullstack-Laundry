import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

function ProductDetail({ addToCart }) {
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [activeImage, setActiveImage] = useState('')
  const [viewerImage, setViewerImage] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
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

    setSelectedSize('')
    setSelectedColor('')
    setActiveImage('')
    setViewerImage(null)
    setMessage('')
    setMessageType('')
    fetchProduct()
  }, [id])

  if (loading) {
    return <div className="loading">Memuat produk...</div>
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

  const parseCsv = (value) =>
    String(value || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)

  const safeParseStock = (value) => {
    if (!value) return {}
    try {
      const parsed = JSON.parse(value)
      if (!parsed || typeof parsed !== 'object') return {}
      return parsed
    } catch (e) {
      return {}
    }
  }

  const safeParseImageArray = (value) => {
    if (!value) return []
    try {
      const parsed = JSON.parse(value)
      if (!Array.isArray(parsed)) return []
      return parsed.filter((v) => typeof v === 'string' && v.trim())
    } catch (e) {
      return []
    }
  }

  const sizes = parseCsv(product.sizes)
  const colors = parseCsv(product.colors)
  const stockMap = safeParseStock(product.stockByColor)
  const variant1Name = (product.variant1Name || '').trim() || 'Variasi 1'
  const variant2Name = (product.variant2Name || '').trim() || 'Variasi 2'
  const hasStockMap = Object.keys(stockMap).length > 0
  const stockVariant = colors.length > 0 ? 'variant2' : sizes.length > 0 ? 'variant1' : null
  const sizeOptions = sizes.map((s) => {
    const pcs = stockVariant === 'variant1' && hasStockMap ? Number(stockMap?.[s] ?? 0) : null
    const disabled = stockVariant === 'variant1' && hasStockMap ? !(Number.isFinite(pcs) && pcs > 0) : false
    return { value: s, pcs: Number.isFinite(pcs) ? pcs : 0, disabled }
  })
  const colorOptions = colors.map((c) => {
    const pcs = stockVariant === 'variant2' && hasStockMap ? Number(stockMap?.[c] ?? 0) : null
    const disabled = stockVariant === 'variant2' && hasStockMap ? !(Number.isFinite(pcs) && pcs > 0) : false
    return { value: c, pcs: Number.isFinite(pcs) ? pcs : 0, disabled }
  })
  const hasSelectableColor = colorOptions.some((c) => !c.disabled)
  const hasSelectableSize = sizeOptions.some((s) => !s.disabled)

  const requireSize = sizes.length > 0
  const requireColor = hasSelectableColor

  const stockTotal = product.stockTotal == null ? null : Number(product.stockTotal)
  const isOutOfStock = Number.isFinite(stockTotal)
    ? stockTotal <= 0
    : hasStockMap && stockVariant === 'variant2'
      ? !hasSelectableColor
      : hasStockMap && stockVariant === 'variant1'
        ? !hasSelectableSize
        : false

  const galleryImages = (() => {
    const extras = safeParseImageArray(product.extraImageUrls)
    const all = [product.photoUrl, ...extras].filter(Boolean)
    const unique = []
    all.forEach((u) => {
      if (!unique.includes(u)) unique.push(u)
    })
    return unique
  })()

  const mainImageSrc = activeImage || galleryImages[0] || 'https://via.placeholder.com/800x800/f1f5f9/94a3b8?text=No+Image'

  const handleAddToCart = () => {
    setMessage('')
    setMessageType('')

    if (isOutOfStock) {
      setMessage('Stok habis.')
      setMessageType('error')
      return
    }
    if (requireSize && !selectedSize) {
      setMessage(`Pilih ${variant1Name.toLowerCase()} dulu sebelum masuk ke keranjang.`)
      setMessageType('error')
      return
    }
    if (requireColor && !selectedColor) {
      setMessage(`Pilih ${variant2Name.toLowerCase()} dulu sebelum masuk ke keranjang.`)
      setMessageType('error')
      return
    }
    if (stockVariant === 'variant1' && hasStockMap && selectedSize) {
      const opt = sizeOptions.find((s) => s.value === selectedSize)
      if (opt?.disabled) {
        setMessage('Stok untuk pilihan ini habis.')
        setMessageType('error')
        return
      }
    }
    if (stockVariant === 'variant2' && hasStockMap && selectedColor) {
      const opt = colorOptions.find((c) => c.value === selectedColor)
      if (opt?.disabled) {
        setMessage('Stok untuk pilihan ini habis.')
        setMessageType('error')
        return
      }
    }

    addToCart(
      { ...product, selectedSize: selectedSize || null, selectedColor: selectedColor || null },
      quantity
    )
    setMessage('Produk ditambahkan ke keranjang.')
    setMessageType('success')
  }

  return (
    <div className="product-detail-page">
      <Link to="/products" className="back-link">
        ← Kembali ke Daftar Produk
      </Link>

      <div className="product-detail-card">
        <div className="product-detail-media">
          <div className="product-detail-badge">
            {product.category || 'Produk Pilihan'}
          </div>
          <div className="product-gallery">
            <button
              type="button"
              className="product-detail-image-frame product-detail-image-button"
              onClick={() => setViewerImage({ src: mainImageSrc, alt: product.name })}
            >
              <img
                src={mainImageSrc}
                alt={product.name}
                className="product-detail-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x800/f1f5f9/94a3b8?text=No+Image'
                }}
              />
            </button>

            {galleryImages.length > 1 && (
              <div className="product-thumbs">
                {galleryImages.map((src) => (
                  <button
                    key={src}
                    type="button"
                    className={`thumb-tile ${mainImageSrc === src ? 'active' : ''}`}
                    onClick={() => setActiveImage(src)}
                    aria-label="Pilih gambar"
                  >
                    <img
                      src={src}
                      alt="Thumbnail"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/160x160/f1f5f9/94a3b8?text=No+Image'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="product-detail-info">
          <div className="product-detail-header">
            <h1>{product.name}</h1>
            <div className="product-detail-price">
              Rp. {Number(product.price || 0).toLocaleString('id-ID')}
            </div>
          </div>

          <div className="product-detail-meta">
            <div className="product-meta-item">
              <span className="product-meta-label">Kategori</span>
              <strong>{product.category || 'Belum dipilih'}</strong>
            </div>
            <div className="product-meta-item">
              <span className="product-meta-label">{variant1Name}</span>
              {sizes.length ? (
                <div className="chip-row">
                  {sizes.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <strong>-</strong>
              )}
            </div>
            <div className="product-meta-item">
              <span className="product-meta-label">{variant2Name}</span>
              {colors.length ? (
                <div className="chip-row">
                  {colors.map((c) => (
                    <span key={c} className="chip">
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <strong>-</strong>
              )}
            </div>
          </div>

          {hasStockMap && stockVariant && (
            <div className="product-detail-section">
              <h3>{`Stok per ${stockVariant === 'variant2' ? variant2Name : variant1Name}`}</h3>
              <div className="stock-list">
                {Object.entries(stockMap).map(([color, pcs]) => (
                  <div key={color} className="stock-list-row">
                    <span className="stock-chip">{color}</span>
                    <strong>{Number(pcs) || 0} pcs</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="product-detail-section">
            <h3>Deskripsi Produk</h3>
            <p>{product.description || 'Produk berkualitas pilihan dari Remon Eccom.'}</p>
          </div>

          <div className="product-detail-purchase">
            {message && (
              <div className={`msg ${messageType} visible`} style={{ display: 'block', margin: 0 }}>
                <div className="alert-content">
                  <span className="icon">{messageType === 'success' ? '✅' : '❌'}</span>
                  <span>{message}</span>
                </div>
              </div>
            )}

            {(requireSize || requireColor) && (
              <div className="variant-picker">
                {requireSize && (
                  <div className="variant-block">
                    <div className="variant-title">{`Pilih ${variant1Name}`}</div>
                    <div className="variant-options">
                      {sizeOptions.map((opt) => (
                        <label
                          key={opt.value}
                          className={`variant-choice ${selectedSize === opt.value ? 'active' : ''} ${opt.disabled ? 'disabled' : ''}`}
                        >
                          <input
                            type="radio"
                            name="variant-size"
                            checked={selectedSize === opt.value}
                            onChange={() => setSelectedSize(opt.value)}
                            disabled={opt.disabled}
                          />
                          <span>
                            {opt.value}
                            {stockVariant === 'variant1' && hasStockMap ? ` • ${opt.pcs} pcs` : ''}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {colors.length > 0 && (
                  <div className="variant-block">
                    <div className="variant-title">{`Pilih ${variant2Name}`}</div>
                    <div className="variant-options">
                      {colorOptions.map((opt) => (
                        <label
                          key={opt.value}
                          className={`variant-choice ${selectedColor === opt.value ? 'active' : ''} ${opt.disabled ? 'disabled' : ''}`}
                        >
                          <input
                            type="radio"
                            name="variant-color"
                            checked={selectedColor === opt.value}
                            onChange={() => setSelectedColor(opt.value)}
                            disabled={opt.disabled}
                          />
                          <span>
                            {opt.value}
                            {stockVariant === 'variant2' && hasStockMap ? ` • ${opt.pcs} pcs` : ''}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="product-quantity-box">
              <label htmlFor="qty">Jumlah</label>
              <div className="product-quantity-control">
                <button
                  type="button"
                  className="qty-action"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <input
                  id="qty"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                />
                <button
                  type="button"
                  className="qty-action"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn primary product-detail-cta"
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
            </button>
          </div>
        </div>
      </div>

      {viewerImage && (
        <div className="image-viewer-overlay" onClick={() => setViewerImage(null)}>
          <div className="image-viewer-dialog" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="image-viewer-close" onClick={() => setViewerImage(null)} aria-label="Tutup gambar">
              ×
            </button>
            <img src={viewerImage.src} alt={viewerImage.alt} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
