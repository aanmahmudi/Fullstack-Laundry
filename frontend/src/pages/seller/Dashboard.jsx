import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function SellerDashboard({ user }) {
  const [shop, setShop] = useState({
    id: user?.shopId ?? null,
    name: user?.shopName ?? '',
    description: user?.shopDescription ?? '',
  })
  const [productCount, setProductCount] = useState(0)
  const [ordersToday, setOrdersToday] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const canUse = useMemo(() => !!user && user.role === 'ADMIN', [user])

  useEffect(() => {
    if (!canUse) return

    const loadData = async () => {
      setLoading(true)
      setMessage('')

      try {
        let shopData = shop
        if (!shopData?.id) {
          const shopRes = await api.get('/shops/mine/details')
          shopData = {
            id: shopRes.data?.id ?? null,
            name: shopRes.data?.name ?? '',
            description: shopRes.data?.description ?? '',
          }
          setShop(shopData)
        }

        if (shopData?.id) {
          const productRes = await api.get('/products', { params: { shopId: shopData.id } })
          const productList = Array.isArray(productRes.data) ? productRes.data : []
          setProductCount(productList.length)
        }

        const txRes = await api.get('/transactions')
        const allTx = Array.isArray(txRes.data) ? txRes.data : []
        const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local
        const countToday = allTx.filter(tx => {
          if (!tx.transactionDate) return false
          const txDateStr = new Date(tx.transactionDate).toLocaleDateString('en-CA')
          return txDateStr === todayStr
        }).length
        setOrdersToday(countToday)
      } catch (error) {
        setMessage('Gagal memuat dashboard toko.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [canUse])

  if (!canUse) {
    return (
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 8px' }}>Akses Ditolak</h2>
        <p style={{ margin: 0, color: '#666' }}>Halaman ini hanya untuk penjual.</p>
      </div>
    )
  }

  return (
    <div className="seller-dashboard">
      <section className="seller-hero">
        <div>
          <span className="seller-kicker">Dashboard Toko</span>
          <h1>{shop?.name || 'Toko Saya'}</h1>
          <p>{shop?.description || 'Deskripsi toko belum diisi.'}</p>
        </div>
        <div className="seller-hero-actions">
          <Link to="/seller/products/new" className="btn primary">
            Tambah Produk
          </Link>
          <Link to="/seller/products" className="btn">
            Lihat Produk Saya
          </Link>
        </div>
      </section>

      {message && (
        <div className="msg error visible" style={{ display: 'block' }}>
          <div className="alert-content">
            <span className="icon">❌</span>
            <span>{message}</span>
          </div>
        </div>
      )}

      <section className="seller-stat-grid">
        <article className="seller-stat-card">
          <span className="seller-stat-label">Jumlah Produk</span>
          <strong>{loading ? '...' : productCount}</strong>
          <p>Total produk aktif yang sudah ada di toko kamu.</p>
        </article>
        <article className="seller-stat-card">
          <span className="seller-stat-label">Pesanan Hari Ini</span>
          <strong>{loading ? '...' : ordersToday}</strong>
          <p>Jumlah pesanan yang masuk ke tokomu hari ini.</p>
        </article>
        <article className="seller-stat-card">
          <span className="seller-stat-label">Aksi Cepat</span>
          <strong>Siap Jual</strong>
          <p>Tambahkan produk baru, cek etalase, lalu pantau pesanan masuk.</p>
        </article>
      </section>

      <section>
        <div className="seller-action-grid">
          <Link to="/seller/products/new" className="seller-action-card">
            <span className="seller-action-icon">➕</span>
            <h3>Tambah Produk</h3>
            <p>Isi kategori, harga, gambar, ukuran, dan deskripsi produk baru.</p>
          </Link>
          <Link to="/seller/products" className="seller-action-card">
            <span className="seller-action-icon">🛍️</span>
            <h3>Produk Saya</h3>
            <p>Lihat seluruh produk toko, filter kategori, dan buka foto tanpa zoom.</p>
          </Link>
          <Link to="/orders" className="seller-action-card">
            <span className="seller-action-icon">📦</span>
            <h3>Pesanan Masuk</h3>
            <p>Pantau transaksi pelanggan yang masuk ke tokomu.</p>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default SellerDashboard
