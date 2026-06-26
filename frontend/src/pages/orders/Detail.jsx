import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

function OrderDetail() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/transactions/${id}`);
      setOrder(res.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!order) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>Pesanan tidak ditemukan</div>;
  }

  return (
    <div className="card order-detail-card">
      <Link to="/orders" className="back-link">
        ← Kembali ke Daftar Pesanan
      </Link>
      <h2>Detail Pesanan #{order.id}</h2>
      
      <div className="order-item">
        <div className="order-item-name">Nomor Order</div>
        <div className="order-item-info">{order.orderNumber || '-'}</div>
      </div>

      <div className="order-item">
        <div className="order-item-name">Produk</div>
        <div className="order-item-info">{order.productName || '-'}</div>
      </div>

      <div className="order-item">
        <div className="order-item-name">Jumlah</div>
        <div className="order-item-info">{order.quantity || 0} pcs</div>
      </div>

      <div className="order-item">
        <div className="order-item-name">Total Harga</div>
        <div className="order-item-info" style={{ fontWeight: 'bold', color: '#667eea', fontSize: '1.25rem' }}>
          Rp {Number(order.totalPrice || 0).toLocaleString('id-ID')}
        </div>
      </div>

      <div className="order-item">
        <div className="order-item-name">Status Pesanan</div>
        <div className={`order-status ${order.orderStatus?.toLowerCase() || 'pending'}`}>
          {order.orderStatus || 'PENDING'}
        </div>
      </div>

      <div className="order-item">
        <div className="order-item-name">Status Pembayaran</div>
        <div className={`order-status ${order.paymentStatus === 'PAID' ? 'paid' : 'pending'}`}>
          {order.paymentStatus || 'UNPAID'}
        </div>
      </div>

      <div className="order-item">
        <div className="order-item-name">Metode Pembayaran</div>
        <div className="order-item-info">{order.paymentMethod || '-'}</div>
      </div>

      <div className="order-item">
        <div className="order-item-name">Alamat Pengiriman</div>
        <div className="order-item-info">{order.shippingAddress || '-'}</div>
      </div>

      <div className="order-item">
        <div className="order-item-name">Catatan</div>
        <div className="order-item-info">{order.notes || '-'}</div>
      </div>

      <div className="order-item">
        <div className="order-item-name">Kode Pembayaran</div>
        <div className="order-item-info" style={{ fontWeight: 'bold', color: '#667eea' }}>
          {order.paymentCode || '-'}
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
