import React, { useEffect, useMemo, useRef, useState } from 'react'
import api from '../../services/api'

function SellerProducts({ user }) {
  const [shop, setShop] = useState({
    id: user?.shopId ?? null,
    name: user?.shopName ?? '',
    description: user?.shopDescription ?? '',
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    sizes: '',
    colors: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const canUse = useMemo(() => !!user && user.role === 'ADMIN', [user])

  const loadShopIfMissing = async () => {
    if (shop?.id) return
    try {
      const res = await api.get('/shops/mine/details')
      setShop({
        id: res.data?.id ?? null,
        name: res.data?.name ?? '',
        description: res.data?.description ?? '',
      })
    } catch (e) {
      setMessage('Gagal memuat data toko.')
      setMessageType('error')
    }
  }

  const fetchProducts = async (shopId) => {
    try {
      setLoading(true)
      const res = await api.get('/products', { params: { shopId } })
      setProducts(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      setMessage('Gagal memuat produk toko.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!canUse) return
    if (shop?.id) return
    loadShopIfMissing()
  }, [canUse, shop?.id])

  useEffect(() => {
    if (!canUse) return
    if (!shop?.id) return
    fetchProducts(shop.id)
  }, [canUse, shop?.id])

  const onPickImage = (file) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageFile(file || null)
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl('')
    }
  }

  const resetForm = () => {
    setForm({ name: '', price: '', description: '', sizes: '', colors: '' })
    onPickImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setMessage('')
    setMessageType('')

    const name = (form.name || '').trim()
    const description = (form.description || '').trim()
    const priceNumber = Number(form.price)
    const sizes = (form.sizes || '').trim()
    const colors = (form.colors || '').trim()

    if (!name) {
      setMessage('Nama produk wajib diisi.')
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
    if (!shop?.id) {
      setMessage('Shop ID tidak ditemukan. Coba login ulang.')
      setMessageType('error')
      return
    }

    setSaving(true)
    try {
      let photoUrl = null
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const uploadRes = await api.post('/products/upload-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        photoUrl = uploadRes.data?.url ?? null
      }

      const payload = {
        name,
        price: String(priceNumber),
        description,
        sizes: sizes || null,
        colors: colors || null,
        ownerId: user.customerId,
        shopId: shop.id,
        photoUrl,
      }

      await api.post('/products', payload)
      setMessage('Produk berhasil ditambahkan.')
      setMessageType('success')
      resetForm()
      await fetchProducts(shop.id)
    } catch (e) {
      const errorMsg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.response?.data?.Error ||
        'Gagal menambahkan produk.'
      setMessage(errorMsg)
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (productId) => {
    setMessage('')
    setMessageType('')
    try {
      await api.delete(`/products/${productId}`, { params: { requesterId: user.customerId } })
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      setMessage('Produk berhasil dihapus.')
      setMessageType('success')
    } catch (e) {
      const errorMsg =
        e.response?.data?.message ||
        e.response?.data?.error ||
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
        <h2>Dashboard Toko</h2>
      </div>

      <section>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>{shop?.name || 'Toko Saya'}</div>
            <div style={{ color: '#64748b', marginTop: '6px', maxWidth: '720px' }}>{shop?.description || 'Deskripsi toko belum diisi.'}</div>
          </div>
          <button className="btn" onClick={() => shop?.id && fetchProducts(shop.id)} disabled={loading}>
            Refresh
          </button>
        </div>
      </section>

      {message && (
        <div className={`msg ${messageType} visible`} style={{ display: 'block' }}>
          <div className="alert-content">
            <span className="icon">{messageType === 'success' ? '✅' : '❌'}</span>
            <span>{message}</span>
          </div>
        </div>
      )}

      <section>
        <h2 style={{ marginTop: 0 }}>Tambah Produk</h2>
        <form onSubmit={handleCreate} className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <label>
            Nama Produk
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={saving}
            />
          </label>
          <label>
            Harga (Rp)
            <input
              type="number"
              min="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              disabled={saving}
            />
          </label>
          <label className="full">
            Deskripsi
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              disabled={saving}
              style={{ resize: 'vertical' }}
            />
          </label>
          <label>
            Ukuran (opsional)
            <input
              type="text"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              disabled={saving}
              placeholder="Contoh: S,M,L"
            />
          </label>
          <label>
            Warna (opsional)
            <input
              type="text"
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
              disabled={saving}
              placeholder="Contoh: Merah,Hitam"
            />
          </label>
          <label className="full">
            Foto Produk (opsional)
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
              disabled={saving}
            />
          </label>
          {previewUrl && (
            <div className="full" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
              />
              <button type="button" className="btn" onClick={() => onPickImage(null)} disabled={saving}>
                Hapus Foto
              </button>
            </div>
          )}
          <div className="full" style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Tambah Produk'}
            </button>
            <button type="button" className="btn" onClick={resetForm} disabled={saving}>
              Reset
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 style={{ marginTop: 0 }}>Produk Saya</h2>
        {loading ? (
          <div className="loading">Memuat...</div>
        ) : products.length === 0 ? (
          <div style={{ color: '#666' }}>Belum ada produk.</div>
        ) : (
          <div className="grid">
            {products.map((p) => (
              <article key={p.id} className="card">
                <figure className="thumb">
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
                <div className="card-body">
                  <h3>{p.name}</h3>
                  <p>{p.description || '-'}</p>
                  <div className="price">Rp {Number(p.price || 0).toLocaleString('id-ID')}</div>
                  <div style={{ marginTop: '10px', color: '#64748b', fontSize: '12px', lineHeight: '1.4' }}>
                    {p.sizes ? `Ukuran: ${p.sizes}` : 'Ukuran: -'}
                    <br />
                    {p.colors ? `Warna: ${p.colors}` : 'Warna: -'}
                  </div>
                </div>
                <div style={{ padding: '0 20px 20px', display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn danger" onClick={() => handleDelete(p.id)}>
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default SellerProducts
