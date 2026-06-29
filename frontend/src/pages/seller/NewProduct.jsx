import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

const CATEGORY_OPTIONS = [
  'Pakaian Pria',
  'Pakaian Wanita',
  'Elektronik',
  'Rumah & Hobi',
  'Kesehatan',
  'Otomotif',
]

const SHIPPING_METHODS = ['J&T', 'SiCepat', 'JNE', 'Shopee Xpress']

function SellerNewProduct({ user }) {
  const navigate = useNavigate()
  const [shop, setShop] = useState({
    id: user?.shopId ?? null,
    name: user?.shopName ?? '',
    description: user?.shopDescription ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [form, setForm] = useState({
    name: '',
    category: CATEGORY_OPTIONS[0],
    price: '',
    description: '',
    variant1Name: '',
    variant2Name: '',
    brand: '',
    material: '',
    shelfLife: '',
    stockTotal: '',
    weightGrams: '',
    packageLengthCm: '',
    packageWidthCm: '',
    packageHeightCm: '',
    preOrder: 'NO',
    preOrderDays: '',
    videoUrl: '',
  })
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [sizeInput, setSizeInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const [stockBySize, setStockBySize] = useState({})
  const [stockByColor, setStockByColor] = useState({})
  const [shippingMethods, setShippingMethods] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const fileInputRef = useRef(null)

  const canUse = useMemo(() => !!user && user.role === 'ADMIN', [user])

  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [previewUrls])

  useEffect(() => {
    if (!canUse || shop?.id) return

    const loadShop = async () => {
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

    loadShop()
  }, [canUse, shop?.id])

  useEffect(() => {
    const category = form.category
    const v1 = (form.variant1Name || '').trim()
    const v2 = (form.variant2Name || '').trim()
    if (v1 && v2) return

    let next1 = v1
    let next2 = v2
    if (category === 'Pakaian Pria' || category === 'Pakaian Wanita') {
      if (!next1) next1 = 'Ukuran'
      if (!next2) next2 = 'Warna'
    } else if (category === 'Elektronik') {
      if (!next1) next1 = 'Spesifikasi'
      if (!next2) next2 = 'Varian'
    } else if (category === 'Otomotif') {
      if (!next1) next1 = 'Tipe'
      if (!next2) next2 = 'Varian'
    } else {
      if (!next1) next1 = 'Varian 1'
      if (!next2) next2 = 'Varian 2'
    }

    setForm((prev) => ({ ...prev, variant1Name: next1, variant2Name: next2 }))
  }, [form.category])

  const onPickImages = (files) => {
    previewUrls.forEach((u) => URL.revokeObjectURL(u))
    const nextFiles = Array.from(files || []).filter(Boolean)
    setImageFiles(nextFiles)
    setPreviewUrls(nextFiles.map((f) => URL.createObjectURL(f)))
  }

  const removeImageAt = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => {
      const url = prev[index]
      if (url) URL.revokeObjectURL(url)
      return prev.filter((_, i) => i !== index)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const resetForm = () => {
    setForm({
      name: '',
      category: CATEGORY_OPTIONS[0],
      price: '',
      description: '',
      variant1Name: '',
      variant2Name: '',
      brand: '',
      material: '',
      shelfLife: '',
      stockTotal: '',
      weightGrams: '',
      packageLengthCm: '',
      packageWidthCm: '',
      packageHeightCm: '',
      preOrder: 'NO',
      preOrderDays: '',
      videoUrl: '',
    })
    setSelectedSizes([])
    setSelectedColors([])
    setSizeInput('')
    setColorInput('')
    setStockBySize({})
    setStockByColor({})
    setShippingMethods([])
    onPickImages([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatIdNumber = (value) => {
    const digits = String(value || '').replace(/\D/g, '')
    if (!digits) return ''
    return Number(digits).toLocaleString('id-ID')
  }

  const normalizeOption = (value) => String(value || '').trim().replace(/\s+/g, ' ')

  const addSize = () => {
    const value = normalizeOption(sizeInput)
    if (!value) return
    setSelectedSizes((prev) => (prev.includes(value) ? prev : [...prev, value]))
    setStockBySize((prev) => (prev[value] == null ? { ...prev, [value]: 1 } : prev))
    setSizeInput('')
  }

  const removeSize = (value) => {
    setSelectedSizes((prev) => prev.filter((v) => v !== value))
    setStockBySize((prev) => {
      const { [value]: _removed, ...rest } = prev
      return rest
    })
  }

  const addColor = () => {
    const value = normalizeOption(colorInput)
    if (!value) return
    setSelectedColors((prev) => (prev.includes(value) ? prev : [...prev, value]))
    setStockByColor((prev) => (prev[value] == null ? { ...prev, [value]: 1 } : prev))
    setColorInput('')
  }

  const removeColor = (value) => {
    setSelectedColors((prev) => prev.filter((v) => v !== value))
    setStockByColor((prev) => {
      const { [value]: _removed, ...rest } = prev
      return rest
    })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setMessage('')
    setMessageType('')

    const name = (form.name || '').trim()
    const category = (form.category || '').trim()
    const description = (form.description || '').trim()
    const variant1Name = (form.variant1Name || '').trim()
    const variant2Name = (form.variant2Name || '').trim()
    const priceNumber = Number((form.price || '').replace(/\./g, ''))
    const brand = (form.brand || '').trim()
    const material = (form.material || '').trim()
    const shelfLife = (form.shelfLife || '').trim()
    const weightGramsNumber = form.weightGrams === '' ? null : Number(form.weightGrams)
    const packageLengthCmNumber = form.packageLengthCm === '' ? null : Number(form.packageLengthCm)
    const packageWidthCmNumber = form.packageWidthCm === '' ? null : Number(form.packageWidthCm)
    const packageHeightCmNumber = form.packageHeightCm === '' ? null : Number(form.packageHeightCm)
    const preOrder = form.preOrder === 'YES'
    const preOrderDaysNumber = form.preOrderDays === '' ? null : Number(form.preOrderDays)
    const videoUrl = (form.videoUrl || '').trim()
    const sizes = selectedSizes.join(',')
    const colors = selectedColors.join(',')
    const useStockByVariant2 = selectedColors.length > 0
    const useStockByVariant1 = !useStockByVariant2 && selectedSizes.length > 0
    const stockOptions = useStockByVariant2 ? selectedColors : useStockByVariant1 ? selectedSizes : []
    const stockSource = useStockByVariant2 ? stockByColor : useStockByVariant1 ? stockBySize : {}
    const stockEntries = stockOptions.map((k) => [k, stockSource?.[k]])
    const stockJson = stockOptions.length
      ? JSON.stringify(Object.fromEntries(stockEntries.map(([k, v]) => [k, Number(v)])))
      : null
    const stockTotalNumber = form.stockTotal === '' ? null : Number(form.stockTotal)
    const computedStockTotal = stockOptions.length > 0 ? stockEntries.reduce((sum, [, v]) => sum + Number(v), 0) : null
    const finalStockTotal = stockOptions.length > 0 ? computedStockTotal : stockTotalNumber

    if (!name) {
      setMessage('Nama produk wajib diisi.')
      setMessageType('error')
      return
    }
    if (name.length > 255) {
      setMessage('Nama produk maksimal 255 karakter.')
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
    if (!Number.isFinite(finalStockTotal) || finalStockTotal <= 0) {
      setMessage('Stok wajib diisi dan harus lebih dari 0.')
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
        const label = useStockByVariant2 ? (variant2Name || 'variasi 2') : (variant1Name || 'variasi 1')
        setMessage(`Stok ${label} "${invalidOption}" wajib diisi dan harus lebih dari 0.`)
        setMessageType('error')
        return
      }
    }
    if (weightGramsNumber == null || !Number.isFinite(weightGramsNumber) || weightGramsNumber <= 0) {
      setMessage('Berat produk wajib diisi (gram) dan harus lebih dari 0.')
      setMessageType('error')
      return
    }
    if (preOrder && (preOrderDaysNumber == null || !Number.isFinite(preOrderDaysNumber) || preOrderDaysNumber <= 2)) {
      setMessage('Jika Pre-Order, isi lama pre-order lebih dari 2 hari.')
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
      let extraImageUrls = null
      if (imageFiles.length > 0) {
        const urls = []
        for (const f of imageFiles) {
          const fd = new FormData()
          fd.append('file', f)
          const uploadRes = await api.post('/products/upload-image', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          const u = uploadRes.data?.url
          if (u) urls.push(u)
        }
        photoUrl = urls[0] ?? null
        extraImageUrls = urls.length ? JSON.stringify(urls) : null
      }

      const payload = {
        name,
        category,
        price: String(priceNumber),
        description,
        sizes: sizes || null,
        colors: colors || null,
        stockByColor: stockJson,
        variant1Name: variant1Name || null,
        variant2Name: variant2Name || null,
        stockTotal: finalStockTotal,
        brand: brand || null,
        material: material || null,
        shelfLife: shelfLife || null,
        weightGrams: weightGramsNumber,
        packageLengthCm: packageLengthCmNumber,
        packageWidthCm: packageWidthCmNumber,
        packageHeightCm: packageHeightCmNumber,
        shippingMethods: shippingMethods.length ? shippingMethods.join(',') : null,
        preOrder,
        preOrderDays: preOrder ? preOrderDaysNumber : null,
        videoUrl: videoUrl || null,
        extraImageUrls,
        ownerId: user.customerId,
        shopId: shop.id,
        photoUrl,
      }

      await api.post('/products', payload)
      setMessage('Produk berhasil ditambahkan.')
      setMessageType('success')
      resetForm()
      window.setTimeout(() => navigate('/seller/products'), 700)
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.Error ||
        'Gagal menambahkan produk.'
      setMessage(errorMsg)
      setMessageType('error')
    } finally {
      setSaving(false)
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
          <h2>Tambah Produk</h2>
          <p className="muted" style={{ margin: '8px 0 0' }}>Ikuti langkah-langkah di bawah agar produk rapi dan mudah ditemukan.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/seller" className="btn">
            Dashboard Toko
          </Link>
          <Link to="/seller/products" className="btn">
            Produk Saya
          </Link>
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

      <section className="seller-guide">
        <h3>Panduan Tambah Produk</h3>
        <ol>
          <li>Tambah Foto/Video: masukkan foto utama, foto detail, dan video (opsional).</li>
          <li>Nama Produk: format Merek + Model/Jenis + Spesifikasi, maksimal 255 karakter.</li>
          <li>Deskripsi: jelaskan bahan/spesifikasi, ukuran, kelengkapan, cara pakai, dan garansi.</li>
          <li>Kategori: pilih yang paling tepat agar mudah ditemukan.</li>
          <li>Atribut Produk: merek (boleh kosong), bahan, masa penyimpanan (jika relevan).</li>
          <li>Harga & Stok: isi harga jual dan stok tersedia.</li>
          <li>Variasi (opsional): masukkan pilihan variasi sesuai spesifikasi barang (mis. ukuran layar/tipe/warna/paket) dan isi stok per opsi variasi.</li>
          <li>Ongkos Kirim: isi berat produk (gram) dan ukuran paket (jika besar).</li>
          <li>Pre-Order: pilih Tidak (siap kirim) atau Ya (butuh waktu kemas).</li>
          <li>Klik Simpan & Tampilkan.</li>
        </ol>
      </section>

      <section>
        <div className="seller-shop-summary">
          <strong>{shop?.name || 'Toko Saya'}</strong>
          <span>{shop?.description || 'Deskripsi toko belum diisi.'}</span>
        </div>

        <form onSubmit={handleCreate} className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <label className="full">
            Tambah Foto Produk (opsional)
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onPickImages(e.target.files)}
              disabled={saving}
            />
            <small className="field-hint">Masukkan foto utama dan foto detail. Foto pertama jadi foto utama.</small>
          </label>

          {previewUrls.length > 0 && (
            <div className="full media-preview-grid">
              {previewUrls.map((src, idx) => (
                <div key={src} className="media-preview-card">
                  <img src={src} alt={`Preview ${idx + 1}`} />
                  <button type="button" className="media-remove" onClick={() => removeImageAt(idx)} disabled={saving}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <label>
            Nama Produk
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={saving}
              maxLength={255}
              placeholder="Contoh: KARBU KEIHIN PE 28MM UNTUK MOTOR BEBEK"
            />
            <small className="field-hint">{255 - (form.name?.length || 0)} karakter tersisa</small>
          </label>

          <label>
            Kategori
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              disabled={saving}
              required
            >
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <small className="field-hint">Contoh: jaket ke Pakaian Pria, helm ke Otomotif.</small>
          </label>

          <label>
            Nama Variasi 1 (opsional)
            <input
              type="text"
              value={form.variant1Name}
              onChange={(e) => setForm({ ...form, variant1Name: e.target.value })}
              disabled={saving}
              placeholder="Contoh: Ukuran Layar / Tipe / Spesifikasi"
            />
          </label>

          <label>
            Nama Variasi 2 (opsional)
            <input
              type="text"
              value={form.variant2Name}
              onChange={(e) => setForm({ ...form, variant2Name: e.target.value })}
              disabled={saving}
              placeholder="Contoh: Warna / Varian / Paket"
            />
          </label>

          <label>
            Harga
            <div className="input-with-icon prefix">
              <span className="icon currency">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: formatIdNumber(e.target.value) })}
                required
                disabled={saving}
              />
            </div>
          </label>

          <label>
            Stok (pcs)
            <input
              type="number"
              min="1"
              value={form.stockTotal}
              onChange={(e) => setForm({ ...form, stockTotal: e.target.value })}
              disabled={saving || selectedColors.length > 0 || selectedSizes.length > 0}
              required={selectedColors.length === 0 && selectedSizes.length === 0}
              placeholder={
                selectedColors.length > 0 || selectedSizes.length > 0
                  ? `Otomatis dari stok per ${selectedColors.length > 0 ? form.variant2Name || 'variasi 2' : form.variant1Name || 'variasi 1'}`
                  : 'Contoh: 50'
              }
            />
            <small className="field-hint">
              {selectedColors.length > 0 || selectedSizes.length > 0
                ? `Jika ada variasi, stok dihitung dari stok per opsi.`
                : 'Isi jumlah stok yang tersedia saat ini.'}
            </small>
          </label>

          <label>
            Merek (opsional)
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              disabled={saving}
              placeholder="Contoh: Keihin / Tidak Ada Merk"
            />
          </label>

          <label>
            Bahan (opsional)
            <input
              type="text"
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
              disabled={saving}
              placeholder="Contoh: Aluminium"
            />
          </label>

          <label>
            Masa Penyimpanan (opsional)
            <input
              type="text"
              value={form.shelfLife}
              onChange={(e) => setForm({ ...form, shelfLife: e.target.value })}
              disabled={saving}
              placeholder="Contoh: 12 bulan"
            />
          </label>

          <div className="field">
            <span className="field-title">{(form.variant1Name || 'Variasi 1') + ' (opsional)'}</span>
            <div className="tag-input-row">
              <input
                type="text"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                placeholder={`Tambah opsi ${form.variant1Name || 'variasi 1'} (contoh: 43 inch / 26mm)`}
                disabled={saving}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSize()
                  }
                }}
              />
              <button type="button" className="btn" onClick={addSize} disabled={saving}>
                Tambah
              </button>
            </div>
            {selectedSizes.length > 0 && (
              <div className="tag-list">
                {selectedSizes.map((s) => (
                  <span key={s} className="tag">
                    {s}
                    <button type="button" className="tag-remove" onClick={() => removeSize(s)} disabled={saving} aria-label="Hapus opsi">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="field">
            <span className="field-title">{(form.variant2Name || 'Variasi 2') + ' (opsional)'}</span>
            <div className="tag-input-row">
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder={`Tambah opsi ${form.variant2Name || 'variasi 2'} (contoh: Hitam / Paket A)`}
                disabled={saving}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addColor()
                  }
                }}
              />
              <button type="button" className="btn" onClick={addColor} disabled={saving}>
                Tambah
              </button>
            </div>
            {selectedColors.length > 0 && (
              <div className="tag-list">
                {selectedColors.map((c) => (
                  <span key={c} className="tag">
                    {c}
                    <button type="button" className="tag-remove" onClick={() => removeColor(c)} disabled={saving} aria-label="Hapus opsi">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <label className="full">
            Stok per {selectedColors.length > 0 ? form.variant2Name || 'variasi 2' : form.variant1Name || 'variasi 1'} (pcs)
            {selectedColors.length === 0 && selectedSizes.length === 0 ? (
              <div className="muted" style={{ fontSize: '13px' }}>Tambahkan opsi variasi dulu jika ingin mengisi stok per opsi.</div>
            ) : (
              <div className="stock-grid">
                {(selectedColors.length > 0 ? selectedColors : selectedSizes).map((opt) => (
                  <div key={opt} className="stock-row">
                    <span className="stock-label">{opt}</span>
                    <input
                      type="number"
                      min="0"
                      value={(selectedColors.length > 0 ? stockByColor : stockBySize)?.[opt] ?? ''}
                      onChange={(e) => {
                        const nextValue = e.target.value === '' ? '' : Number(e.target.value)
                        if (selectedColors.length > 0) {
                          setStockByColor((prev) => ({ ...prev, [opt]: nextValue }))
                        } else {
                          setStockBySize((prev) => ({ ...prev, [opt]: nextValue }))
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
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              disabled={saving}
              style={{ resize: 'vertical' }}
              placeholder={'• Spesifikasi / bahan\n• Ukuran / kompatibilitas\n• Kelengkapan\n• Cara pakai\n• Garansi (jika ada)'}
            />
          </label>

          <label className="full">
            Video Produk (opsional)
            <input
              type="url"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              disabled={saving}
              placeholder="Link video (opsional)"
            />
          </label>

          <label>
            Berat Produk (gram)
            <input
              type="number"
              min="1"
              value={form.weightGrams}
              onChange={(e) => setForm({ ...form, weightGrams: e.target.value })}
              required
              disabled={saving}
              placeholder="Contoh: 250"
            />
          </label>

          <label>
            Ukuran Paket (P x L x T) cm (opsional)
            <div className="package-grid">
              <input
                type="number"
                min="1"
                value={form.packageLengthCm}
                onChange={(e) => setForm({ ...form, packageLengthCm: e.target.value })}
                disabled={saving}
                placeholder="P"
              />
              <input
                type="number"
                min="1"
                value={form.packageWidthCm}
                onChange={(e) => setForm({ ...form, packageWidthCm: e.target.value })}
                disabled={saving}
                placeholder="L"
              />
              <input
                type="number"
                min="1"
                value={form.packageHeightCm}
                onChange={(e) => setForm({ ...form, packageHeightCm: e.target.value })}
                disabled={saving}
                placeholder="T"
              />
            </div>
          </label>

          <div className="field full">
            <span className="field-title">Jasa Kirim (opsional)</span>
            <div className="variant-options">
              {SHIPPING_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`variant-option ${shippingMethods.includes(m) ? 'active' : ''}`}
                  onClick={() =>
                    setShippingMethods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
                  }
                  disabled={saving}
                >
                  {m}
                </button>
              ))}
            </div>
            <small className="field-hint">Bisa dipilih lebih dari satu.</small>
          </div>

          <label>
            Pre-Order
            <select value={form.preOrder} onChange={(e) => setForm({ ...form, preOrder: e.target.value })} disabled={saving}>
              <option value="NO">Tidak</option>
              <option value="YES">Ya</option>
            </select>
          </label>

          <label>
            Lama Pre-Order (hari)
            <input
              type="number"
              min="1"
              value={form.preOrderDays}
              onChange={(e) => setForm({ ...form, preOrderDays: e.target.value })}
              disabled={saving || form.preOrder !== 'YES'}
              placeholder={form.preOrder === 'YES' ? 'Contoh: 3' : 'Nonaktif'}
            />
            <small className="field-hint">Isi jika Pre-Order = Ya dan lebih dari 2 hari.</small>
          </label>

          <div className="full" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan & Tampilkan'}
            </button>
            <button type="button" className="btn" onClick={resetForm} disabled={saving}>
              Reset
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default SellerNewProduct
