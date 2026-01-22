const CART_KEY = 'laundry_cart';
const AUTH_KEY = 'laundry_user';
const PENDING_EMAIL_KEY = 'laundry_pending_email';
const PENDING_OTP_KEY = 'laundry_pending_otp';

export const State = {
  getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  },
  setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    const count = items.reduce((sum, x) => sum + (Number(x.qty) || 1), 0);
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }));
  },
  addToCart(item) {
    const items = State.getCart();
    const idx = items.findIndex((x) => x.id === item.id);
    if (idx >= 0) {
      const current = items[idx];
      const nextQty = (Number(current.qty) || 1) + (Number(item.qty) || 1);
      items[idx] = { ...current, qty: nextQty };
    } else {
      items.push({ ...item, qty: Number(item.qty) || 1 });
    }
    State.setCart(items);
  },
  removeFromCart(index) {
    const items = State.getCart();
    items.splice(index, 1);
    State.setCart(items);
  },
  setQty(index, qty) {
    const q = Math.max(1, Number(qty) || 1);
    const items = State.getCart();
    if (items[index]) { items[index].qty = q; State.setCart(items); }
  },
  clearCart() { State.setCart([]); },

  getUser() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; }
  },
  setUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('user:updated', { detail: { user } }));
  },
  clearUser() {
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new CustomEvent('user:updated', { detail: { user: null } }));
  },

  setPendingEmail(email) {
    if (email) localStorage.setItem(PENDING_EMAIL_KEY, String(email));
    else localStorage.removeItem(PENDING_EMAIL_KEY);
  },
  getPendingEmail() { return localStorage.getItem(PENDING_EMAIL_KEY) || null; },
  clearPendingEmail() { localStorage.removeItem(PENDING_EMAIL_KEY); },

  setPendingOTP(otp) {
    this.pendingOTP = otp;
    localStorage.setItem('laundry_pending_otp', otp);
  },
  
  getPendingOTP() {
    return this.pendingOTP || localStorage.getItem('laundry_pending_otp');
  },
  
  clearPendingOTP() {
    this.pendingOTP = null;
    localStorage.removeItem('laundry_pending_otp');
  },
};