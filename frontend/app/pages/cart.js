import { State } from '../core/state.js';

export function CartPage() {
  const html = `
    <section>
      <h2>Keranjang</h2>
      <div id="cart-items"></div>
      <div class="actions">
        <a class="btn primary" href="#/checkout">Checkout</a>
        <button id="btn-clear" class="btn ghost">Kosongkan</button>
      </div>
    </section>
  `;

  window.__bindPage = () => {
    const container = document.getElementById('cart-items');
    const items = State.getCart();
    if (!items.length) {
      container.innerHTML = '<p>Keranjang kosong.</p>';
    } else {
      const total = items.reduce((sum, x) => sum + (x.price * (x.qty || 1)), 0);
      container.innerHTML = `
        <ul class="list">
          ${items.map((x, i) => `
            <li>
              [${x.id}] ${x.name} — Rp ${x.price}
              <div class="actions">
                <button data-i="${i}" class="btn small btn-dec">-</button>
                <span style="margin:0 8px">${x.qty || 1}</span>
                <button data-i="${i}" class="btn small btn-inc">+</button>
                <button data-i="${i}" class="btn small danger btn-del">Hapus</button>
              </div>
            </li>
          `).join('')}
        </ul>
        <p><strong>Total:</strong> Rp ${total}</p>
      `;
      container.querySelectorAll('.btn-del').forEach((b) => {
        b.addEventListener('click', () => {
          State.removeFromCart(Number(b.dataset.i));
          window.location.hash = '#/cart';
        });
      });
      container.querySelectorAll('.btn-inc').forEach((b) => {
        b.addEventListener('click', () => {
          const i = Number(b.dataset.i);
          const list = State.getCart();
          const q = (Number(list[i]?.qty) || 1) + 1;
          State.setQty(i, q);
          window.location.hash = '#/cart';
        });
      });
      container.querySelectorAll('.btn-dec').forEach((b) => {
        b.addEventListener('click', () => {
          const i = Number(b.dataset.i);
          const list = State.getCart();
          const q = Math.max(1, (Number(list[i]?.qty) || 1) - 1);
          State.setQty(i, q);
          window.location.hash = '#/cart';
        });
      });
    }
    document.getElementById('btn-clear').addEventListener('click', () => {
      State.clearCart();
      window.location.hash = '#/cart';
    });
  };

  return html;
}