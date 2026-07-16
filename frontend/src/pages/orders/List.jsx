import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/transactions');
      let allOrders = res.data || [];
      
      if (user && user.role !== 'ADMIN' && user.customerId) {
        allOrders = allOrders.filter(order => order.customerId === user.customerId);
      }
      
      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="orders-container">
      <h2>Daftar Pesanan</h2>
      {orders.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center' }}>Anda belum memiliki pesanan</p>
          <Link to="/products" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem', width: '100%', textAlign: 'center' }}>
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-id">Order #{order.id} - {order.orderNumber || 'No Order Number'}</div>
            <div className="order-date">
              {order.transactionDate ? new Date(order.transactionDate).toLocaleString('id-ID') : 'Tanggal tidak tersedia'}
            </div>
            <div className={`order-status ${order.orderStatus?.toLowerCase() || 'pending'}`}>
              Status: {order.orderStatus || 'PENDING'}
            </div>
            <div className="order-status paid">
              Payment: {order.paymentStatus || 'UNPAID'}
            </div>
            <div className="order-total">
              Total: Rp. {Number(order.totalPrice || 0).toLocaleString('id-ID')}
            </div>
            <Link to={`/orders/${order.id}`} className="order-link">
              Lihat Detail →
            </Link>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;
