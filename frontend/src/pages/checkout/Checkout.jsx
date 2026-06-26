import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function Checkout({ cart, clearCart, user }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [formData, setFormData] = useState({
    shippingAddress: '',
    paymentMethod: 'COD',
    notes: '',
  });
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      // Create transactions one by one (since backend expects single product per transaction)
      for (const item of cart) {
        await api.post('/transactions', {
          customerId: user.customerId,
          productId: item.id,
          quantity: item.quantity,
          shippingAddress: formData.shippingAddress,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
        });
      }
      
      setMessage('Pesanan berhasil dibuat!');
      setMessageType('success');
      clearCart();

      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Gagal membuat pesanan. Silakan coba lagi.';
      setMessage(errorMsg);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2>Checkout</h2>
      {message && (
        <div className={`alert alert-${messageType}`}>{message}</div>
      )}
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>Ringkasan Pesanan</h3>
        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #eee' }}>
            <span>{item.name} x {item.quantity}</span>
            <span style={{ fontWeight: 'bold' }}>
              Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', color: '#667eea', padding: '1rem 0', marginBottom: '1.5rem' }}>
          <span>Total:</span>
          <span>Rp {total.toLocaleString('id-ID')}</span>
        </div>

        <div className="form-group">
          <label>Alamat Pengiriman</label>
          <textarea
            value={formData.shippingAddress}
            onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
            required
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Metode Pembayaran</label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          >
            <option value="COD">COD</option>
            <option value="TRANSFER">Transfer Bank</option>
            <option value="CREDIT_CARD">Kartu Kredit</option>
          </select>
        </div>

        <div className="form-group">
          <label>Catatan</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Loading...' : 'Buat Pesanan'}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
