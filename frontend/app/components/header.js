import { navigate } from '../core/router.js';
import { State } from '../core/state.js?v=remon14';

export function renderHeader(el) {
  if (!el) return;
  function render() {
    const path = window.location.pathname;
    const isAuthPage =
      path.includes('/login') ||
      path.includes('/register') ||
      path.includes('/forgot-password') ||
      path.includes('/verify') ||
      path.includes('/reset-password') ||
      path.includes('/new-password');
    
    if (isAuthPage) {
      el.style.display = 'block';
      el.innerHTML = `
        <div class="header-container">
          <div class="header-left">
            <a class="brand" href="/dashboard">
              <span style="color: var(--primary); font-weight: 800; font-size: 26px; letter-spacing: -0.5px;">Remon</span>
              <span style="font-weight: 600; font-size: 26px; color: var(--primary); margin-left: 4px;">Eccom</span>
            </a>
          </div>
        </div>
      `;
      return;
    } else {
      el.style.display = 'block';
    }

    const user = State.getUser();
    const count = State.getCart().reduce((s, x) => s + (Number(x.qty) || 1), 0);

    // HTML Structure
    el.innerHTML = `
      <div class="header-container">
        <!-- Logo -->
        <div class="header-left">
          <a class="brand" href="/dashboard">
            <span style="color: var(--primary); font-weight: 800; font-size: 26px; letter-spacing: -0.5px;">Remon</span>
            <span style="font-weight: 600; font-size: 26px; color: var(--primary); margin-left: 4px;">Eccom</span>
          </a>
        </div>

        <!-- Search Bar -->
        <div class="header-search">
          <form id="global-search" class="search-form">
            <input id="global-search-input" type="text" placeholder="Cari produk di Remon Eccom..." aria-label="Cari produk" />
            <button type="submit" style="background: #f1f5f9; border: 1px solid #e2e8f0; border-left: none; border-radius: 0 99px 99px 0; width: 60px; display: flex; align-items: center; justify-content: center;">
                <span class="icon" style="color: #64748b;">🔍</span>
            </button>
          </form>
        </div>

        <!-- Actions -->
        <div class="header-actions">
          ${user ? `
            ${user.role === 'ADMIN' ? `
              <a href="/admin/shops" class="nav-link">
                Admin
              </a>
              <a href="/admin/shops" id="header-admin-chat" class="nav-link" style="position:relative;overflow:visible;">
                Chat
                <span id="admin-chat-badge" style="display:none;margin-left:6px;background:#ef4444;color:#ffffff;border-radius:999px;padding:2px 6px;font-size:11px;font-weight:700;line-height:1;min-width:18px;text-align:center;"></span>
              </a>
            ` : `
              <a href="/orders" class="nav-link">Transaksi</a>
              <a href="#" id="header-chat" class="nav-link" style="position:relative;overflow:visible;">
                Chat
                <span id="user-msg-badge" style="display:none;margin-left:6px;background:#ef4444;color:#ffffff;border-radius:999px;padding:2px 6px;font-size:11px;font-weight:700;line-height:1;min-width:18px;text-align:center;"></span>
              </a>
            `}
          ` : ''}
          
          <a href="/cart" class="icon-btn cart-btn" title="Keranjang">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            ${count > 0 ? `<span class="badge">${count}</span>` : ''}
          </a>

          ${user ? `
            <div class="user-menu-container">
              <div class="user-menu-trigger">
                <div class="avatar-placeholder" style="background: var(--primary);">
                  ${(user.shopName || user.username || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div class="user-info-mini">
                   <span class="user-name">${user.shopName || user.username || 'User'}</span>
                </div>
              </div>
              
              <div class="user-dropdown">
                 <div class="dropdown-header">
                    <strong>${user.username || user.email.split('@')[0]}</strong>
                    <span class="role-badge">${user.role}</span>
                 </div>
                 ${user.role === 'ADMIN' ? `
                   <a href="/admin/orders" class="dropdown-item">Pesanan Masuk (Toko)</a>
                   <a href="/admin/shops" class="dropdown-item">Pesan Masuk (Chat)</a>
                   <a href="/admin/my-products" class="dropdown-item">Kelola Produk</a>
                 ` : `
                   <a href="/orders" class="dropdown-item">Riwayat Belanja</a>
                 `}
                 <a href="/change-password" class="dropdown-item">Ganti Password</a>
                 <div class="dropdown-divider"></div>
                 <a href="#" id="header-logout" class="dropdown-item danger">Logout</a>
              </div>
            </div>
          ` : `
            <div class="auth-buttons">
              <a href="/register" class="btn-text" style="font-weight: 600;">Daftar</a>
              <div style="width: 1px; height: 16px; background: #ddd;"></div>
              <a href="/login" class="btn-text" style="font-weight: 600;">Login</a>
            </div>
          `}
        </div>
      </div>
    `;

    if (window.__headerChatBadgeTimer) {
      clearInterval(window.__headerChatBadgeTimer);
      window.__headerChatBadgeTimer = null;
    }

    const updateHeaderChatBadges = async () => {
      if (!user || typeof API === 'undefined') return;
      try {
        const unread = await API.apiGet(`/api/customers/${user.id}/chat/unread-count`);
        const n = Number(unread || 0);
        if (user.role === 'ADMIN') {
          const badge = document.getElementById('admin-chat-badge');
          if (badge) {
            badge.textContent = String(n);
            badge.style.display = n > 0 ? 'inline-block' : 'none';
          }
        } else {
          const badge = document.getElementById('user-msg-badge');
          if (badge) {
            badge.textContent = String(n);
            badge.style.display = n > 0 ? 'inline-block' : 'none';
          }
        }
      } catch (_) {
        const adminBadge = document.getElementById('admin-chat-badge');
        const userBadge = document.getElementById('user-msg-badge');
        if (adminBadge) adminBadge.style.display = 'none';
        if (userBadge) userBadge.style.display = 'none';
      }
    };

    window.__headerChatBadgeTimer = setInterval(updateHeaderChatBadges, 9000);
    updateHeaderChatBadges();

    const openUserChatInbox = () => {
      const u = State.getUser();
      if (!u || typeof API === 'undefined') return;

      let overlay = document.getElementById('header-chat-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'header-chat-overlay';
        overlay.style.position = 'fixed';
        overlay.style.bottom = '16px';
        overlay.style.right = '16px';
        overlay.style.width = '480px';
        overlay.style.height = '550px';
        overlay.style.maxHeight = '85vh';
        overlay.style.display = 'none';
        overlay.style.zIndex = '9999';
        overlay.style.background = '#ffffff';
        overlay.style.border = '1px solid #e5e7eb';
        overlay.style.borderRadius = '8px';
        overlay.style.overflow = 'hidden';
        overlay.style.boxShadow = '0 10px 30px rgba(15,23,42,0.25)';

        overlay.innerHTML = `
          <div style="height:100%;display:flex;flex-direction:column;">
            <div style="padding:12px 14px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;background:#f0fdf4;">
              <div>
                <div style="margin:0;font-size:15px;color:#166534;font-weight:700;">Chat</div>
                <div style="margin:2px 0 0;font-size:12px;color:#6b7280;">Pesan masuk dari toko.</div>
              </div>
              <div style="display:flex;gap:6px;align-items:center;">
                <button id="btn-refresh-user-inbox" class="btn" style="padding:4px 10px;font-size:12px;">Muat Ulang</button>
                <button id="btn-close-user-inbox" type="button" style="border:none;background:transparent;color:#6b7280;font-size:18px;cursor:pointer;line-height:1;">×</button>
              </div>
            </div>
            <div style="flex:1;display:grid;grid-template-columns:170px minmax(0,1fr);min-height:0;overflow:hidden;">
              <div id="user-inbox-list" style="border-right:1px solid #e5e7eb;overflow-y:auto;background:#ffffff;height:100%;">
                <div class="loading" style="font-size:13px;color:#6b7280;padding:8px 10px;">Memuat daftar chat...</div>
              </div>
              <div style="display:flex;flex-direction:column;min-width:0;height:100%;overflow:hidden;">
                <div id="user-inbox-header" style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;display:flex;flex-direction:column;gap:2px;background:#f9fafb;">
                  <div style="font-weight:600;color:#111827;font-size:13px;">Tidak ada chat yang dipilih</div>
                  <div style="font-size:11px;color:#9ca3af;">Pilih toko di sebelah kiri untuk melihat chat.</div>
                </div>
                <div id="user-inbox-thread" style="flex:1;overflow-y:auto;padding:10px 12px;background:#f9fafb;font-size:12px;color:#6b7280;">
                  <div style="font-size:12px;color:#9ca3af;">Belum ada percakapan yang dipilih.</div>
                </div>
                <div style="border-top:1px solid #e5e7eb;padding:8px 10px;background:#f9fafb;">
                  <div style="border-radius:8px;border:1px solid #d1d5db;padding:8px 10px;display:flex;flex-direction:column;gap:6px;background:#ffffff;">
                    <div id="user-inbox-recipient" style="font-size:12px;color:#6b7280;">Pilih toko dulu sebelum membalas.</div>
                    <textarea id="user-inbox-input" rows="3" style="width:100%;border:none;outline:none;font-size:12px;resize:vertical;min-height:60px;max-height:120px;box-sizing:border-box;" placeholder="Tulis pesan..." disabled></textarea>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <div id="user-inbox-status" style="flex:1;min-width:0;font-size:11px;color:#16a34a;display:block;visibility:hidden;"></div>
                      <div style="display:flex;gap:8px;margin-left:auto;">
                        <button id="user-inbox-cancel" type="button" style="border:1px solid #d1d5db;background:white;color:#374151;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;">Batal</button>
                        <button id="user-inbox-send" type="button" style="border:none;background:#22c55e;color:white;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;" disabled>
                          <span>📩</span><span>Kirim</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(overlay);
      }

      const closeBtn = overlay.querySelector('#btn-close-user-inbox');
      if (closeBtn) {
        closeBtn.onclick = () => {
          overlay.style.display = 'none';
        };
      }

      const listEl = overlay.querySelector('#user-inbox-list');
      const headerEl = overlay.querySelector('#user-inbox-header');
      const threadEl = overlay.querySelector('#user-inbox-thread');
      const recipientEl = overlay.querySelector('#user-inbox-recipient');
      const inputEl = overlay.querySelector('#user-inbox-input');
      const statusEl = overlay.querySelector('#user-inbox-status');
      const sendBtn = overlay.querySelector('#user-inbox-send');
      const cancelBtn = overlay.querySelector('#user-inbox-cancel');
      const refreshBtn = overlay.querySelector('#btn-refresh-user-inbox');

      let activeShopId = null;
      let activeShopName = '';

      const renderThread = (messages) => {
        if (!threadEl) return;
        if (!messages || messages.length === 0) {
          threadEl.innerHTML = `<div style="font-size:12px;color:#9ca3af;">Belum ada percakapan. Kirim pesan pertama ke toko ini.</div>`;
          return;
        }
        threadEl.innerHTML = messages
          .map((m) => {
            const isMe = !m.fromAdmin;
            const time = m.createdAt ? new Date(m.createdAt).toLocaleString('id-ID') : '';
            return `
              <div style="display:flex;margin-bottom:6px;${isMe ? 'justify-content:flex-end;' : 'justify-content:flex-start;'}">
                <div style="max-width:75%;padding:6px 8px;border-radius:8px;background:${isMe ? '#22c55e' : '#ffffff'};color:${isMe ? '#ffffff' : '#111827'};font-size:12px;white-space:pre-line;box-shadow:0 1px 2px rgba(15,23,42,0.08);">
                  <div>${m.content}</div>
                  <div style="font-size:10px;opacity:0.7;margin-top:2px;text-align:${isMe ? 'right' : 'left'};">${time}</div>
                </div>
              </div>
            `;
          })
          .join('');
        threadEl.scrollTop = threadEl.scrollHeight;
      };

      const loadThread = async (shopId, shopName) => {
        activeShopId = shopId;
        activeShopName = shopName || '';
        if (headerEl) {
          headerEl.innerHTML = `
            <div style="font-weight:600;color:#111827;">${activeShopName || 'Toko'}</div>
            <div style="font-size:11px;color:#6b7280;">Chat dengan toko ini.</div>
          `;
        }
        if (recipientEl) recipientEl.textContent = `Balas chat untuk ${activeShopName || 'toko'}:`;
        if (inputEl) {
          inputEl.disabled = false;
          inputEl.placeholder = 'Tulis pesan...';
        }
        if (sendBtn) sendBtn.disabled = false;
        if (threadEl) threadEl.innerHTML = `<div style="font-size:12px;color:#9ca3af;">Memuat percakapan...</div>`;
        try {
          const items = await API.apiGet(`/api/shops/${shopId}/messages/thread?customerId=${u.id}`);
          renderThread(items || []);
          try {
            await API.apiPost(`/api/shops/${shopId}/messages/thread/mark-read?viewer=customer&customerId=${u.id}`, {});
          } catch (_) {}
          updateHeaderChatBadges();
        } catch (e) {
          if (threadEl) threadEl.innerHTML = `<div style="font-size:12px;color:#dc2626;">Gagal memuat percakapan: ${e.message}</div>`;
        }
      };

      const loadConversations = async () => {
        if (!listEl) return;
        listEl.innerHTML = `<div class="loading" style="font-size:13px;color:#6b7280;padding:8px 10px;">Memuat daftar chat...</div>`;
        try {
          const items = await API.apiGet(`/api/customers/${u.id}/chat/conversations`);
          if (!Array.isArray(items) || items.length === 0) {
            listEl.innerHTML = `<div style="font-size:13px;color:#9ca3af;padding:8px 10px;">Belum ada chat.</div>`;
            if (threadEl) threadEl.innerHTML = `<div style="font-size:12px;color:#9ca3af;">Belum ada percakapan.</div>`;
            if (inputEl) inputEl.disabled = true;
            if (sendBtn) sendBtn.disabled = true;
            return;
          }
          const conv = items
            .map((x) => ({
              shopId: Number(x.shopId),
              shopName: x.shopName || `Toko #${x.shopId}`,
              lastMessage: x.lastMessage || '',
              lastTime: x.lastTime || null,
              unreadCount: Number(x.unreadCount || 0)
            }))
            .sort((a, b) => {
              if ((b.unreadCount || 0) !== (a.unreadCount || 0)) return (b.unreadCount || 0) - (a.unreadCount || 0);
              return new Date(b.lastTime || 0) - new Date(a.lastTime || 0);
            });

          listEl.innerHTML = conv
            .map((c) => {
              const timeText = c.lastTime ? new Date(c.lastTime).toLocaleDateString('id-ID') : '';
              const preview = c.lastMessage.length > 40 ? c.lastMessage.slice(0, 40) + '…' : c.lastMessage;
              return `
                <div class="user-inbox-item" data-shop-id="${c.shopId}" data-shop-name="${c.shopName}" style="padding:8px 10px;border-bottom:1px solid #f1f5f9;cursor:pointer;display:flex;gap:8px;align-items:center;font-size:13px;">
                  <div style="width:28px;height:28px;border-radius:999px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#374151;">
                    ${String(c.shopName || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                      <span style="font-weight:600;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.shopName}</span>
                      <div style="display:flex;align-items:center;gap:6px;">
                        ${c.unreadCount > 0 ? `<span style="background:#ef4444;color:#ffffff;border-radius:999px;padding:2px 6px;font-size:11px;font-weight:700;line-height:1;min-width:18px;text-align:center;">${c.unreadCount}</span>` : ``}
                        <span style="font-size:11px;color:#9ca3af;">${timeText}</span>
                      </div>
                    </div>
                    <div style="font-size:12px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${preview}</div>
                  </div>
                </div>
              `;
            })
            .join('');

          const rows = Array.from(listEl.querySelectorAll('.user-inbox-item'));
          rows.forEach((row) => {
            row.onclick = () => {
              rows.forEach((r) => (r.style.background = ''));
              row.style.background = '#f1f5f9';
              const sid = Number(row.getAttribute('data-shop-id'));
              const sname = row.getAttribute('data-shop-name') || '';
              loadThread(sid, sname);
            };
          });

          if (rows.length > 0) {
            rows[0].style.background = '#f1f5f9';
            const sid = Number(rows[0].getAttribute('data-shop-id'));
            const sname = rows[0].getAttribute('data-shop-name') || '';
            loadThread(sid, sname);
          }
          updateHeaderChatBadges();
        } catch (e) {
          listEl.innerHTML = `<div style="font-size:13px;color:#dc2626;padding:8px 10px;">Gagal memuat daftar chat: ${e.message}</div>`;
        }
      };

      if (refreshBtn) refreshBtn.onclick = loadConversations;

      if (cancelBtn && inputEl && statusEl) {
        cancelBtn.onclick = () => {
          inputEl.value = '';
          statusEl.style.visibility = 'hidden';
          statusEl.textContent = '';
        };
      }

      if (sendBtn && inputEl && statusEl) {
        sendBtn.onclick = async () => {
          const text = String(inputEl.value || '').trim();
          if (!activeShopId) return;
          if (!text) return;
          sendBtn.disabled = true;
          statusEl.style.visibility = 'visible';
          statusEl.style.color = '#16a34a';
          statusEl.textContent = 'Mengirim pesan...';
          try {
            await API.apiPost(`/api/shops/${activeShopId}/messages`, {
              senderCustomerId: u.id,
              content: text,
              fromAdmin: false
            });
            inputEl.value = '';
            statusEl.style.visibility = 'visible';
            statusEl.style.color = '#16a34a';
            statusEl.textContent = 'Pesan terkirim.';
            await loadThread(activeShopId, activeShopName);
            await loadConversations();
          } catch (e) {
            statusEl.style.visibility = 'visible';
            statusEl.style.color = '#dc2626';
            statusEl.textContent = 'Gagal mengirim pesan: ' + e.message;
          } finally {
            sendBtn.disabled = false;
          }
        };
      }

      if (inputEl && sendBtn) {
        inputEl.onkeydown = (ev) => {
          if (ev.key === 'Enter' && !ev.shiftKey) {
            ev.preventDefault();
            sendBtn.click();
          }
        };
      }

      overlay.style.display = 'block';
      loadConversations();
    };

    // Bind event listeners
    el.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', async (ev) => {
        ev.preventDefault();
        const href = a.getAttribute('href');
        const id = a.id;

        if (id === 'header-logout') {
          try {
            if (user?.email && typeof API !== 'undefined') {
              await API.apiPost('/api/auth/logout', { email: user.email });
            }
          } catch (_) {}
          State.clearUser();
          navigate('/login');
        } else if (id === 'header-chat') {
          openUserChatInbox();
        } else {
          navigate(href);
        }
      });
    });

    // Search bar listener
    const form = el.querySelector('#global-search');
    const input = el.querySelector('#global-search-input');
    if (form && input) {
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const q = String(input.value || '').trim();
        if (!location.pathname.startsWith('/products')) navigate('/products');
        window.dispatchEvent(new CustomEvent('global:search', { detail: { q } }));
      });
    }
  }

  // Initial render
  render();

  // Listen for hash changes to toggle visibility
  window.addEventListener('popstate', render);

  // Listen for user updates (login/logout) to re-render header
  window.addEventListener('user:updated', () => render());

  // Listen for cart updates to update badge
  window.addEventListener('cart:updated', (e) => {
    render();
  });
}
