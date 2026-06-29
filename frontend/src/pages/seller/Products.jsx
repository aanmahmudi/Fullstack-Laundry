import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const CATEGORY_OPTIONS = [
  'Semua',
  'Pakaian Pria',
  'Pakaian Wanita',
  'Elektronik',
  'Rumah & Hobi',
  'Kesehatan',
  'Otomotif',
]

function SellerProducts({ user }) {
  const [shop, setShop] = useState({
    id: user?.shopId ?? null,
    name: user?.shopName ?? '',
    description: user?.shopDescription ?? '',
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [viewerImage, setViewerImage] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editSizes, setEditSizes] = useState([])
  const [editColors, setEditColors] = useState([])
  const [editSizeInput, setEditSizeInput] = useState('')
  const [editColorInput, setEditColorInput] = useState('')
  const [editStockBySize, setEditStockBySize] = useState({})
  const [editStockByColor, setEditStockByColor] = useState({})
  const [editImageFile, setEditImageFile] = useState(null)
  const [editPreviewUrl, setEditPreviewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const editFileInputRef = useRef(null)

  const canUse = useMemo(() => !!user && user.role === 'ADMIN', [user])

  useEffect(() => {
    return () => {
      if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl)
    }
  }, [editPreviewUrl])

  const loadShopIfMissing = async () => {
    if (shop?.id) return
    try {
      const res = await api.get('/shops/mine/details')
      setShop({
        id: res.data?.id ?? null,
        name: res.data?.name ?? '',
        description: res.data?.description ?? '',
      })
    } catch (error) {
      setMessage('Gagal memuat data toko.')
      setMessageType('error')
    }
  }

  const fetchProducts = async (shopId, category = activeCategory) => {
    try {
      setLoading(true)
      const params = { shopId }
      if (category && category !== 'Semua') {
        params.category = category
      }
      const res = await api.get('/products', { params })
      setProducts(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      setMessage('Gagal memuat produk toko.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
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

  const formatIdNumber = (value) => {
    const digits = String(value || '').replace(/\D/g, '')
    if (!digits) return ''
    return Number(digits).toLocaleString('id-ID')
  }

  const normalizeOption = (value) => String(value || '').trim().replace(/\s+/g, ' ')

  const openEdit = (product) => {
    setMessage('')
    setMessageType('')
    setEditing(product)
    setEditForm({
      name: product?.name ?? '',
      category: product?.category ?? 'Pakaian Pria',
      price: formatIdNumber(product?.price ?? ''),
      description: product?.description ?? '',
      variant1Name: product?.variant1Name ?? '',
      variant2Name: product?.variant2Name ?? '',
    })
    const sizes = parseCsv(product?.sizes)
    const colors = parseCsv(product?.colors)
    setEditSizes(sizes)
    setEditColors(colors)
    setEditSizeInput('')
    setEditColorInput('')
    const stock = safeParseStock(product?.stockByColor)
    if (colors.length > 0) {
      const cleanedStock = {}
      colors.forEach((c) => {
        const num = Number(stock?.[c])
        if (Number.isFinite(num) && num > 0) cleanedStock[c] = num
        else cleanedStock[c] = 1
      })
      setEditStockByColor(cleanedStock)
      setEditStockBySize({})
    } else if (sizes.length > 0) {
      const cleanedStock = {}
      sizes.forEach((s) => {
        const num = Number(stock?.[s])
        if (Number.isFinite(num) && num > 0) cleanedStock[s] = num
        else cleanedStock[s] = 1
      })
      setEditStockBySize(cleanedStock)
      setEditStockByColor({})
    } else {
      setEditStockBySize({})
      setEditStockByColor({})
    }
    setEditImageFile(null)
    if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl)
    setEditPreviewUrl('')
    if (editFileInputRef.current) editFileInputRef.current.value = ''
  }

  const closeEdit = () => {
    setEditing(null)
    setEditForm(null)
    setEditSizes([])
    setEditColors([])
    setEditSizeInput('')
    setEditColorInput('')
    setEditStockBySize({})
    setEditStockByColor({})
    setEditImageFile(null)
    if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl)
    setEditPreviewUrl('')
    if (editFileInputRef.current) editFileInputRef.current.value = ''
  }

  const onPickEditImage = (file) => {
    if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl)
    setEditImageFile(file || null)
    setEditPreviewUrl(file ? URL.createObjectURL(file) : '')
  }

  const addEditSize = () => {
    const value = normalizeOption(editSizeInput)
    if (!value) return
    setEditSizes((prev) => (prev.includes(value) ? prev : [...prev, value]))
    setEditStockBySize((prev) => (prev[value] == null ? { ...prev, [value]: 1 } : prev))
    setEditSizeInput('')
  }

  const removeEditSize = (value) => {
    setEditSizes((prev) => prev.filter((v) => v !== value))
    setEditStockBySize((prev) => {
      const { [value]: _removed, ...rest } = prev
      return rest
    })
  }

  const addEditColor = () => {
    const value = normalizeOption(editColorInput)
    if (!value) return
    setEditColors((prev) => (prev.includes(value) ? prev : [...prev, value]))
    setEditStockByColor((prev) => (prev[value] == null ? { ...prev, [value]: 1 } : prev))
    setEditColorInput('')
  }

  const removeEditColor = (value) => {
    setEditColors((prev) => prev.filter((v) => v !== value))
    setEditStockByColor((prev) => {
      const { [value]: _removed, ...rest } = prev
      return rest
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editing || !editForm) return
    setMessage('')
    setMessageType('')

    const name = String(editForm.name || '').trim()
    const category = String(editForm.category || '').trim()
    const description = String(editForm.description || '').trim()
    const priceNumber = Number(String(editForm.price || '').replace(/\./g, ''))
    const sizes = editSizes.join(',')
    const colors = editColors.join(',')
    const useStockByVariant2 = editColors.length > 0
    const useStockByVariant1 = !useStockByVariant2 && editSizes.length > 0
    const stockOptions = useStockByVariant2 ? editColors : useStockByVariant1 ? editSizes : []
    const stockSource = useStockByVariant2 ? editStockByColor : useStockByVariant1 ? editStockBySize : {}
    const stockEntries = stockOptions.map((k) => [k, stockSource?.[k]])
    const stockJson = stockOptions.length
      ? JSON.stringify(Object.fromEntries(stockEntries.map(([k, v]) => [k, Number(v)])))
      : null
    const computedStockTotal = stockOptions.length > 0 ? stockEntries.reduce((sum, [, v]) => sum + Number(v), 0) : null

    if (!name) {
      setMessage('Nama produk wajib diisi.')
      setMessageType('error')
      return
    }
    if (!category) {
      setMessage('Kategori produk wajib dipilih.')
      setMessageType('error')
      return
    }
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setMessage('Harga produk wajib diisi dan harus lebih dari 0.')
      setMessageType('error')
      return
    }
    if (!description) {
      setMessage('Deskripsi produk wajib diisi.')
      setMessageType('error')
      return
    }
    if (stockOptions.length > 0) {
      const invalidOption = stockOptions.find((opt) => !Number.isFinite(Number(stockSource?.[opt])) || Number(stockSource?.[opt]) <= 0)
      if (invalidOption) {
        const label = useStockByVariant2 ? (String(editForm.variant2Name || '').trim() || 'variasi 2') : (String(editForm.variant1Name || '').trim() || 'variasi 1')
        setMessage(`Stok ${label} "${invalidOption}" wajib diisi dan harus lebih dari 0.`)
        setMessageType('error')
        return
      }
    }

    setSaving(true)
    try {
      let photoUrl = editing.photoUrl ?? null
      if (editImageFile) {
        const fd = new FormData()
        fd.append('file', editImageFile)
        const uploadRes = await api.post('/products/upload-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        photoUrl = uploadRes.data?.url ?? photoUrl
      }

      const payload = {
        id: editing.id,
        name,
        category,
        price: String(priceNumber),
        description,
        sizes: sizes || null,
        colors: colors || null,
        stockByColor: stockJson,
        stockTotal: computedStockTotal ?? editing.stockTotal ?? null,
        variant1Name: String(editForm.variant1Name || '').trim() || null,
        variant2Name: String(editForm.variant2Name || '').trim() || null,
        ownerId: editing.ownerId,
        shopId: editing.shopId ?? shop.id,
        photoUrl,
      }

      const res = await api.put(`/products/${editing.id}`, payload, { params: { requesterId: user.customerId } })
      const updated = res.data
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setMessage('Produk berhasil diperbarui.')
      setMessageType('success')
      closeEdit()
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Gagal memperbarui produk.'
      setMessage(errorMsg)
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!canUse) return
    if (shop?.id) return
    loadShopIfMissing()
  }, [canUse, shop?.id])

  useEffect(() => {
    if (!canUse || !shop?.id) return
    fetchProducts(shop.id, activeCategory)
  }, [canUse, shop?.id, activeCategory])

  const handleDelete = async (productId) => {
    setMessage('')
    setMessageType('')
    try {
      await api.delete(`/products/${productId}`, { params: { requesterId: user.customerId } })
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      setMessage('Produk berhasil dihapus.')
      setMessageType('success')
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Gagal menghapus produk.'
      setMessage(errorMsg)
      setMessageType('error')
    }
  }

  if (!canUse) {
    return (
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 8px' }}>Akses Ditolak</h2>
        <p style={{ margin: 0, color: '#666' }}>Halaman ini hanya untuk penjual.</p>
      </div>
    )
  }

  return (
    <div className="product-layout">
      <div className="actions">
        <div>
          <h2>Produk Saya</h2>
          <p className="muted" style={{ margin: '8px 0 0' }}>
            Foto bisa diklik untuk melihat penuh tanpa efek zoom terpotong.
          </p>
        </div>
        <div className="seller-toolbar">
          <Link to="/seller" className="btn">
            Dashboard Toko
          </Link>
          <Link to="/seller/products/new" className="btn primary">
            Tambah Produk
          </Link>
          <button className="btn" onClick={() => shop?.id && fetchProducts(shop.id, activeCategory)} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className={`msg ${messageType} visible`} style={{ display: 'block' }}>
          <div className="alert-content">
            <span className="icon">{messageType === 'success' ? '✅' : '❌'}</span>
            <span>{message}</span>
          </div>
        </div>
      )}

      <section>
        <div className="seller-list-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>{shop?.name || 'Toko Saya'}</div>
            <div style={{ color: '#64748b', marginTop: '6px', maxWidth: '720px' }}>{shop?.description || 'Deskripsi toko belum diisi.'}</div>
          </div>
          <div className="seller-filter">
            <span>Filter Kategori</span>
            <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section>
        {loading ? (
          <div className="loading">Memuat...</div>
        ) : products.length === 0 ? (
          <div style={{ color: '#666' }}>Belum ada produk pada kategori ini.</div>
        ) : (
          <div className="grid">
            {products.map((p) => (
              <article key={p.id} className="card">
                <button
                  type="button"
                  className="thumb-button"
                  onClick={() =>
                    setViewerImage({
                      src: p.photoUrl || 'https://via.placeholder.com/900x700/f1f5f9/94a3b8?text=No+Image',
                      alt: p.name,
                    })
                  }
                >
                  <figure className="thumb contain">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300/f1f5f9/94a3b8?text=No+Image'
                        }}
                      />
                    ) : (
                      <img src="https://via.placeholder.com/400x300/f1f5f9/94a3b8?text=No+Image" alt="No Image" />
                    )}
                  </figure>
                </button>
                <div className="card-body">
                  <div className="product-category-badge">{p.category || 'Tanpa Kategori'}</div>
                  <h3>{p.name}</h3>
                  <p>{p.description || '-'}</p>
                  <div className="price">Rp. {Number(p.price || 0).toLocaleString('id-ID')}</div>
                  <div style={{ marginTop: '10px', color: '#64748b', fontSize: '12px', lineHeight: '1.4' }}>
                    {p.sizes ? `${(p.variant1Name || 'Variasi 1')}: ${p.sizes}` : `${(p.variant1Name || 'Variasi 1')}: -`}
                    <br />
                    {p.colors ? `${(p.variant2Name || 'Variasi 2')}: ${p.colors}` : `${(p.variant2Name || 'Variasi 2')}: -`}
                  </div>
                </div>
                <div style={{ padding: '0 20px 20px', display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn" onClick={() => openEdit(p)}>
                    Edit
                  </button>
                  <button type="button" className="btn danger" onClick={() => handleDelete(p.id)}>
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editing && editForm && (
        <div className="image-viewer-overlay" onClick={closeEdit}>
          <div className="seller-edit-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="seller-edit-header">
              <h3>Edit Produk</h3>
              <button type="button" className="image-viewer-close" onClick={closeEdit} aria-label="Tutup">
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate} className="seller-edit-form">
              <div className="seller-edit-grid">
                <label>
                  Nama Produk
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    disabled={saving}
                  />
                </label>

                <label>
                  Kategori
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                    disabled={saving}
                    required
                  >
                    {CATEGORY_OPTIONS.filter((c) => c !== 'Semua').map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Harga
                  <div className="input-with-icon prefix">
                    <span className="icon currency">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, price: formatIdNumber(e.target.value) }))}
                      required
                      disabled={saving}
                    />
                  </div>
                </label>

                <label>
                  Nama Variasi 1 (opsional)
                  <input
                    type="text"
                    value={editForm.variant1Name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, variant1Name: e.target.value }))}
                    disabled={saving}
                    placeholder="Contoh: Ukuran Layar / Tipe / Spesifikasi"
                  />
                </label>

                <label>
                  Nama Variasi 2 (opsional)
                  <input
                    type="text"
                    value={editForm.variant2Name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, variant2Name: e.target.value }))}
                    disabled={saving}
                    placeholder="Contoh: Warna / Varian / Paket"
                  />
                </label>

                <div className="field">
                  <span className="field-title">{(editForm.variant1Name || 'Variasi 1') + ' (opsional)'}</span>
                  <div className="tag-input-row">
                    <input
                      type="text"
                      value={editSizeInput}
                      onChange={(e) => setEditSizeInput(e.target.value)}
                      placeholder={`Tambah opsi ${editForm.variant1Name || 'variasi 1'} (contoh: 43 inch / 26mm)`}
                      disabled={saving}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addEditSize()
                        }
                      }}
                    />
                    <button type="button" className="btn" onClick={addEditSize} disabled={saving}>
                      Tambah
                    </button>
                  </div>
                  {editSizes.length > 0 && (
                    <div className="tag-list">
                      {editSizes.map((s) => (
                        <span key={s} className="tag">
                          {s}
                          <button type="button" className="tag-remove" onClick={() => removeEditSize(s)} disabled={saving} aria-label="Hapus opsi">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="field">
                  <span className="field-title">{(editForm.variant2Name || 'Variasi 2') + ' (opsional)'}</span>
                  <div className="tag-input-row">
                    <input
                      type="text"
                      value={editColorInput}
                      onChange={(e) => setEditColorInput(e.target.value)}
                      placeholder={`Tambah opsi ${editForm.variant2Name || 'variasi 2'} (contoh: Hitam / Paket A)`}
                      disabled={saving}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addEditColor()
                        }
                      }}
                    />
                    <button type="button" className="btn" onClick={addEditColor} disabled={saving}>
                      Tambah
                    </button>
                  </div>
                  {editColors.length > 0 && (
                    <div className="tag-list">
                      {editColors.map((c) => (
                        <span key={c} className="tag">
                          {c}
                          <button type="button" className="tag-remove" onClick={() => removeEditColor(c)} disabled={saving} aria-label="Hapus opsi">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <label className="full">
                  Stok per {editColors.length > 0 ? editForm.variant2Name || 'variasi 2' : editForm.variant1Name || 'variasi 1'} (pcs)
                  {editColors.length === 0 && editSizes.length === 0 ? (
                    <div className="muted" style={{ fontSize: '13px' }}>Tambahkan opsi variasi dulu jika ingin mengisi stok per opsi.</div>
                  ) : (
                    <div className="stock-grid">
                      {(editColors.length > 0 ? editColors : editSizes).map((opt) => (
                        <div key={opt} className="stock-row">
                          <span className="stock-label">{opt}</span>
                          <input
                            type="number"
                            min="0"
                            value={(editColors.length > 0 ? editStockByColor : editStockBySize)?.[opt] ?? ''}
                            onChange={(e) => {
                              const nextValue = e.target.value === '' ? '' : Number(e.target.value)
                              if (editColors.length > 0) {
                                setEditStockByColor((prev) => ({ ...prev, [opt]: nextValue }))
                              } else {
                                setEditStockBySize((prev) => ({ ...prev, [opt]: nextValue }))
                              }
                            }}
                            disabled={saving}
                            className="stock-input"
                          />
                          <span className="stock-suffix">pcs</span>
                        </div>
                      ))}
                    </div>
                  )}
                </label>

                <label className="full">
                  Deskripsi
                  <textarea
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                    required
                    disabled={saving}
                    style={{ resize: 'vertical' }}
                  />
                </label>

                <label className="full">
                  Foto Produk
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickEditImage(e.target.files?.[0] ?? null)}
                    disabled={saving}
                  />
                </label>

                <div className="full seller-edit-image-row">
                  <img
                    src={
                      editPreviewUrl ||
                      editing.photoUrl ||
                      'https://via.placeholder.com/400x300/f1f5f9/94a3b8?text=No+Image'
                    }
                    alt="Preview"
                    className="seller-preview-image"
                  />
                  {editPreviewUrl && (
                    <button type="button" className="btn" onClick={() => onPickEditImage(null)} disabled={saving}>
                      Hapus Foto Baru
                    </button>
                  )}
                </div>
              </div>

              <div className="seller-edit-actions">
                <button type="button" className="btn" onClick={closeEdit} disabled={saving}>
                  Batal
                </button>
                <button type="submit" className="btn primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default SellerProducts
