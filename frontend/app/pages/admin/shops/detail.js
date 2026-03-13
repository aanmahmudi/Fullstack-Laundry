import { State } from '../../../core/state.js';

export function ShopDetailPage(params) {
  const shopId = params.id;
  const user = State.getUser();
  if (!user || user.role !== 'ADMIN') {
    setTimeout(() => { window.location.href = '/'; }, 0);
    return '';
  }

  const html = `
  <div class="hero-section" style="height: 200px; margin-bottom: 20px;">
    <div class="hero-content">
      <h1 id="shop-name-title">Loading...</h1>
      <p id="shop-desc">Memuat detail toko...</p>
    </div>
  </div>

  <section class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
        <div class="actions" style="margin-bottom: 20px; display: flex; justify-content: space-between; gap: 16px; align-items: center;">
          <a href="/admin/shops" class="btn btn-text">← Kembali ke Daftar Toko</a>
          <div style="display:flex; gap:10px; align-items:center;">
          <button id="btn-open-chat" class="btn" style="background:#f97316;color:white;position:relative;overflow:visible;">
            <span>Buka Chat Toko</span>
            <span id="admin-open-chat-badge" style="position:absolute;top:-6px;right:-6px;background:#ef4444;color:#ffffff;border-radius:999px;padding:2px 6px;font-size:11px;font-weight:700;line-height:1;display:none;min-width:18px;text-align:center;"></span>
          </button>
          <a href="/products/add?shopId=${shopId}" class="btn primary">＋ Tambah Produk di Toko Ini</a>
        </div>
      </div>
      
      <div style="display:grid; grid-template-columns: 1fr; gap:24px; align-items:flex-start;">
        <div>
          <h3>Produk di Toko Ini</h3>
          <div id="shop-products-grid" class="grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
            <div class="loading">Memuat produk...</div>
          </div>
        </div>

      </div>

      <aside id="shop-chat-panel" class="panel" style="border:1px solid #e5e7eb; border-radius:8px; padding:0; display:none; flex-direction:column; position:fixed; bottom:16px; right:16px; width:480px; height:550px; max-height:85vh; overflow:hidden; z-index:9999; box-shadow:0 10px 30px rgba(15,23,42,0.25); background:#ffffff;">
        <div style="padding:12px 14px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;background:#f0fdf4;">
          <div>
            <h3 style="margin:0; font-size:15px; color:#166534;">Chat Admin Toko</h3>
            <p style="margin:2px 0 0; font-size:12px; color:#6b7280;">Balas pesan pelanggan untuk toko ini.</p>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <button id="btn-refresh-chat" class="btn" style="padding:4px 10px; font-size:12px;">Muat Ulang</button>
            <button id="shop-chat-close" type="button" style="border:none;background:transparent;color:#6b7280;font-size:18px;cursor:pointer;line-height:1;">×</button>
          </div>
        </div>
        <div style="padding:12px 14px;border-bottom:1px solid #f3f4f6;display:flex;gap:10px;align-items:center;">
          <div style="width:40px;height:40px;border-radius:999px;border:1px solid #e5e7eb;overflow:hidden;background:#f9fafb;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#111827;">
            A
          </div>
          <div style="flex:1;min-width:0;">
            <div id="shop-chat-shop-name" style="font-size:13px;font-weight:500;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Chat Toko</div>
            <div id="shop-chat-shop-subtitle" style="font-size:12px;color:#6b7280;">Daftar pelanggan yang menghubungi toko ini.</div>
          </div>
        </div>
        <div style="flex:1;display:grid;grid-template-columns:170px minmax(0, 1fr);min-height:0;overflow:hidden;">
          <div id="shop-chat-list" style="border-right:1px solid #e5e7eb;overflow-y:auto;background:#ffffff;height:100%;">
            <div class="loading" style="font-size:13px;color:#6b7280;padding:8px 10px;">Memuat daftar chat...</div>
          </div>
          <div style="display:flex;flex-direction:column;min-width:0;height:100%;overflow:hidden;">
            <div id="shop-chat-header" style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;display:flex;flex-direction:column;gap:2px;background:#f9fafb;">
              <div style="font-weight:600;color:#111827;font-size:13px;">Tidak ada pelanggan yang dipilih</div>
              <div style="font-size:11px;color:#9ca3af;">Pilih pelanggan di sebelah kiri untuk mulai chat.</div>
            </div>
            <div id="shop-chat-thread" style="flex:1;overflow-y:auto;padding:10px 12px;background:#f9fafb;font-size:12px;color:#6b7280;">
              <div style="font-size:12px;color:#9ca3af;">Belum ada percakapan yang dipilih.</div>
            </div>
            <div style="border-top:1px solid #e5e7eb;padding:8px 10px;background:#f9fafb;">
              <div style="border-radius:8px;border:1px solid #d1d5db;padding:8px 10px;display:flex;flex-direction:column;gap:6px;background:#ffffff;">
                <div id="shop-chat-recipient" style="font-size:12px;color:#6b7280;">Pilih pelanggan dulu sebelum membalas.</div>
                <textarea id="shop-chat-input" rows="3" style="width:100%;border:none;outline:none;font-size:12px;resize:vertical;min-height:60px;max-height:120px;box-sizing:border-box;" placeholder="Tulis balasan ke pelanggan..." disabled></textarea>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div id="shop-chat-status" style="flex:1;min-width:0;font-size:11px;color:#16a34a;display:block;visibility:hidden;"></div>
                  <div style="display:flex;gap:8px;margin-left:auto;">
                    <button id="shop-chat-cancel" type="button" style="border:1px solid #d1d5db;background:white;color:#374151;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;">Batal</button>
                    <button id="shop-chat-send" class="btn primary" style="border:none;background:#22c55e;color:white;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;" disabled>
                      <span>📩</span><span>Kirim</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <button id="admin-chat-fab" type="button" style="position:fixed;bottom:16px;right:16px;z-index:9998;border:none;border-radius:999px;background:#22c55e;color:white;padding:8px 14px;font-size:13px;display:flex;align-items:center;gap:6px;box-shadow:0 6px 18px rgba(15,23,42,0.3);cursor:pointer;overflow:visible;">
        <span>💬</span><span>Chat</span>
        <span id="admin-chat-badge" style="position:absolute;top:-6px;right:-6px;background:#ef4444;color:#ffffff;border-radius:999px;padding:2px 6px;font-size:11px;font-weight:700;line-height:1;display:none;min-width:18px;text-align:center;"></span>
      </button>
  </div>
  </section>`;

  window.__bindPage = async () => {
    console.log('ShopDetailPage v122 loaded');
    try {
      // 1. Get Shop Detail
      const shop = await API.apiGet(`/api/shops/${shopId}`);
      if (shop) {
        document.getElementById('shop-name-title').textContent = shop.name;
        document.getElementById('shop-desc').textContent = shop.description || 'Tidak ada deskripsi';
      }

      // 2. Get Products in this Shop
      const products = await API.apiGet(`/api/products?shopId=${shopId}`);
      const grid = document.getElementById('shop-products-grid');
      
      if (products.length === 0) {
        grid.innerHTML = `
          <div class="panel" style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <p>Belum ada produk di toko ini.</p>
            <a href="/products/add?shopId=${shopId}" class="btn primary" style="margin-top: 10px;">Tambah Produk Sekarang</a>
          </div>
        `;
        return;
      }

      grid.innerHTML = products.map(p => {
        let photoUrl = p.photoUrl;
        if (photoUrl && photoUrl.startsWith('/')) {
            const baseUrl = (window.API && window.API.BASE_URL) || 'http://localhost:8081';
            photoUrl = baseUrl + photoUrl;
        }
        return `
        <div class="product-card">
            <div class="image-container">
              <img src="${photoUrl || 'https://via.placeholder.com/300?text=No+Image'}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=No+Image';" />
            </div>
            <div class="product-info">
              <h3 class="product-name">${p.name}</h3>
              <p class="product-price">Rp ${parseInt(p.price).toLocaleString('id-ID')}</p>
              <div class="product-actions" style="margin-top: 10px;">
                 <button class="btn btn-sm btn-delete-product" data-id="${p.id}" style="width: 100%; background: #ff4d4f; color: white;">Hapus</button>
              </div>
            </div>
        </div>
      `;
      }).join('');

      // Bind delete buttons
      grid.querySelectorAll('.btn-delete-product').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Yakin hapus produk ini?')) {
            try {
              await API.apiDelete(`/api/products/${btn.dataset.id}?requesterId=${user.id}`);
              btn.closest('.product-card').remove();
            } catch (err) {
              alert('Gagal hapus: ' + err.message);
            }
          }
        });
      });

      const chatPanelEl = document.getElementById('shop-chat-panel');
      const chatListEl = document.getElementById('shop-chat-list');
      const chatThreadEl = document.getElementById('shop-chat-thread');
      const chatHeaderEl = document.getElementById('shop-chat-header');
      const chatRecipientEl = document.getElementById('shop-chat-recipient');
      const chatInputEl = document.getElementById('shop-chat-input');
      const chatStatusEl = document.getElementById('shop-chat-status');
      const chatSendBtn = document.getElementById('shop-chat-send');
      const chatCancelBtn = document.getElementById('shop-chat-cancel');
      const refreshChatBtn = document.getElementById('btn-refresh-chat');
      const openChatBtn = document.getElementById('btn-open-chat');
      const closeChatBtn = document.getElementById('shop-chat-close');
      const adminChatFab = document.getElementById('admin-chat-fab');
      const adminChatBadge = document.getElementById('admin-chat-badge');
      const adminOpenChatBadge = document.getElementById('admin-open-chat-badge');

      let activeCustomerId = null;
      let activeCustomerName = '';
      let activeCustomerPhone = '';

      const renderThread = (messages) => {
        if (!chatThreadEl) return;
        if (!messages || messages.length === 0) {
          chatThreadEl.innerHTML = `<div style="font-size:12px;color:#9ca3af;">Belum ada percakapan. Kirim pesan pertama ke pelanggan ini.</div>`;
          return;
        }
        chatThreadEl.innerHTML = messages
          .map((m) => {
            const isMe = !!m.fromAdmin;
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
        chatThreadEl.scrollTop = chatThreadEl.scrollHeight;
      };

      const loadThread = async (customerId, customerName, customerPhone) => {
        if (!chatThreadEl) return;
        activeCustomerId = customerId;
        activeCustomerName = customerName || '';
        activeCustomerPhone = customerPhone || '';
        if (chatHeaderEl) {
          chatHeaderEl.innerHTML = `
            <div style="font-weight:600;color:#111827;">${activeCustomerName || 'Pelanggan'}</div>
            <div style="font-size:11px;color:#6b7280;">ID Customer: #${customerId}${activeCustomerPhone ? ' • ' + activeCustomerPhone : ''}</div>
          `;
        }
        if (chatRecipientEl) {
          chatRecipientEl.textContent = `Balas chat untuk ${activeCustomerName || 'pelanggan'}:`;
        }
        chatThreadEl.innerHTML = `<div style="font-size:12px;color:#9ca3af;">Memuat percakapan dengan ${customerName || 'pelanggan'}...</div>`;
        if (chatInputEl) {
          chatInputEl.disabled = false;
          chatInputEl.placeholder = 'Tulis pesan...';
        }
        if (chatSendBtn) {
          chatSendBtn.disabled = false;
        }
        try {
          const items = await API.apiGet(`/api/shops/${shopId}/messages/thread?customerId=${customerId}`);
          renderThread(items || []);
          try {
            await API.apiPost(`/api/shops/${shopId}/messages/thread/mark-read?viewer=admin&customerId=${customerId}`, {});
          } catch (_) {}
          try {
            await updateAdminBadge();
          } catch (_) {}
        } catch (e) {
          chatThreadEl.innerHTML = `<div style="font-size:12px;color:#dc2626;">Gagal memuat percakapan: ${e.message}</div>`;
        }
      };

      const updateAdminBadge = async () => {
        try {
          const n = await API.apiGet(`/api/shops/${shopId}/messages/unread-count?viewer=admin`);
          const count = Number(n || 0);
          const show = count > 0;
          if (adminChatBadge) {
            adminChatBadge.textContent = String(count);
            adminChatBadge.style.display = show ? 'inline-flex' : 'none';
          }
          if (adminOpenChatBadge) {
            adminOpenChatBadge.textContent = String(count);
            adminOpenChatBadge.style.display = show ? 'inline-flex' : 'none';
          }
        } catch (_) {
          if (adminChatBadge) adminChatBadge.style.display = 'none';
          if (adminOpenChatBadge) adminOpenChatBadge.style.display = 'none';
        }
      };

      const loadChatList = async () => {
        if (!chatListEl) return;
        chatListEl.innerHTML = `<div class="loading" style="font-size:13px; color:#6b7280; padding:8px 10px;">Memuat daftar chat...</div>`;
        try {
          const messages = await API.apiGet(`/api/shops/${shopId}/messages?unreadOnly=false`);
          if (!Array.isArray(messages) || messages.length === 0) {
            chatListEl.innerHTML = `<div style="font-size:13px; color:#9ca3af; padding:8px 10px;">Belum ada pesan dari pelanggan.</div>`;
            if (chatThreadEl) {
              chatThreadEl.innerHTML = `<div style="font-size:12px;color:#9ca3af;">Belum ada percakapan. Tunggu sampai ada pelanggan yang menghubungi.</div>`;
            }
            if (chatInputEl) chatInputEl.disabled = true;
            if (chatSendBtn) chatSendBtn.disabled = true;
            return;
          }

          const grouped = {};
          messages.forEach((m) => {
            const cid = m.senderCustomerId;
            if (!cid) return;
            if (!grouped[cid]) grouped[cid] = [];
            grouped[cid].push(m);
          });

          const chats = Object.keys(grouped).map((cid) => {
            const list = grouped[cid];
            list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            const latest = list[0];
            const unreadCount = list.filter((x) => !x.fromAdmin && !x.read).length;
            return {
              customerId: Number(cid),
              name: latest.senderName || `Customer #${cid}`,
              phone: latest.senderPhone || '',
              lastMessage: latest.content || '',
              lastTime: latest.createdAt || null,
              unreadCount
            };
          });

          chats.sort((a, b) => {
            if ((b.unreadCount || 0) !== (a.unreadCount || 0)) return (b.unreadCount || 0) - (a.unreadCount || 0);
            return new Date(b.lastTime || 0) - new Date(a.lastTime || 0);
          });

          chatListEl.innerHTML = chats
            .map((c) => {
              const timeText = c.lastTime ? new Date(c.lastTime).toLocaleDateString('id-ID') : '';
              const preview =
                c.lastMessage.length > 40 ? c.lastMessage.slice(0, 40) + '…' : c.lastMessage || '';
              return `
                <div class="shop-chat-item" data-customer-id="${c.customerId}" data-customer-name="${c.name}" data-customer-phone="${c.phone || ''}" style="padding:8px 10px; border-bottom:1px solid #f1f5f9; cursor:pointer; display:flex; gap:8px; align-items:center; font-size:13px;">
                  <div style="width:28px;height:28px;border-radius:999px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#374151;">
                    ${c.name.charAt(0).toUpperCase()}
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                      <span style="font-weight:600;color:#111827;">${c.name}</span>
                      <div style="display:flex;align-items:center;gap:6px;">
                        ${c.unreadCount > 0 ? `<span style="background:#ef4444;color:#ffffff;border-radius:999px;padding:2px 6px;font-size:11px;font-weight:700;line-height:1;min-width:18px;text-align:center;">${c.unreadCount}</span>` : ``}
                        <span style="font-size:11px;color:#9ca3af;">${timeText}</span>
                      </div>
                    </div>
                    <div style="font-size:11px;color:#6b7280;">${c.phone || '-'}</div>
                    <div style="font-size:12px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${preview}</div>
                  </div>
                </div>
              `;
            })
            .join('');

          const items = Array.from(chatListEl.querySelectorAll('.shop-chat-item'));
          items.forEach((item) => {
            item.addEventListener('click', () => {
              const cid = Number(item.getAttribute('data-customer-id'));
              const cname = item.getAttribute('data-customer-name') || '';
              const cphone = item.getAttribute('data-customer-phone') || '';
              items.forEach((el) => {
                el.style.background = '';
              });
              item.style.background = '#f1f5f9';
              loadThread(cid, cname, cphone);
            });
          });

          // Otomatis pilih pelanggan pertama agar langsung tampil thread tanpa klik lagi
          if (items.length > 0) {
            const first = items[0];
            first.style.background = '#f1f5f9';
            const cid = Number(first.getAttribute('data-customer-id'));
            const cname = first.getAttribute('data-customer-name') || '';
            const cphone = first.getAttribute('data-customer-phone') || '';
            loadThread(cid, cname, cphone);
          }
          try {
            await updateAdminBadge();
          } catch (_) {}
        } catch (e) {
          chatListEl.innerHTML = `<div style="font-size:13px; color:#dc2626; padding:8px 10px;">Gagal memuat daftar chat: ${e.message}</div>`;
        }
      };

      const openAdminChat = () => {
        if (!chatPanelEl) return;
        chatPanelEl.style.display = 'flex';
        updateAdminBadge();
        loadChatList();
      };

      const closeAdminChat = () => {
        if (!chatPanelEl) return;
        chatPanelEl.style.display = 'none';
      };

      if (refreshChatBtn) {
        refreshChatBtn.addEventListener('click', loadChatList);
      }
      if (openChatBtn) {
        openChatBtn.addEventListener('click', openAdminChat);
      }
      if (adminChatFab) {
        adminChatFab.addEventListener('click', openAdminChat);
      }
      if (closeChatBtn) {
        closeChatBtn.addEventListener('click', closeAdminChat);
      }

      // Check URL param openChat=true
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('openChat') === 'true') {
        openAdminChat();
        // Remove param from URL without reload
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({path:newUrl},'',newUrl);
      }

      if (window.__adminChatBadgeTimer) {
        clearInterval(window.__adminChatBadgeTimer);
      }
      window.__adminChatBadgeTimer = setInterval(updateAdminBadge, 8000);
      updateAdminBadge();

        if (chatSendBtn) {
        chatSendBtn.addEventListener('click', async () => {
          if (!activeCustomerId) {
            alert('Pilih pelanggan dulu dari daftar chat.');
            return;
          }
          if (!chatInputEl) return;
          const text = String(chatInputEl.value || '').trim();
          if (!text) return;
          chatSendBtn.disabled = true;
          if (chatStatusEl) {
            chatStatusEl.style.visibility = 'visible';
            chatStatusEl.style.color = '#16a34a';
            chatStatusEl.textContent = 'Mengirim balasan...';
          }
          try {
            await API.apiPost(`/api/shops/${shopId}/messages`, {
              senderCustomerId: activeCustomerId,
              content: text,
              fromAdmin: true
            });
            if (chatInputEl) {
              chatInputEl.value = '';
            }
            if (chatStatusEl) {
              chatStatusEl.style.visibility = 'visible';
              chatStatusEl.style.color = '#16a34a';
              chatStatusEl.textContent = 'Balasan terkirim.';
            }
            await loadThread(activeCustomerId, activeCustomerName);
            await loadChatList();
          } catch (e) {
            if (chatStatusEl) {
              chatStatusEl.style.visibility = 'visible';
              chatStatusEl.style.color = '#dc2626';
              chatStatusEl.textContent = 'Gagal mengirim balasan: ' + e.message;
            } else {
              alert('Gagal mengirim balasan: ' + e.message);
            }
          } finally {
            chatSendBtn.disabled = false;
          }
        });
      }

      if (chatCancelBtn && chatInputEl && chatStatusEl) {
        chatCancelBtn.addEventListener('click', () => {
          chatInputEl.value = '';
          chatStatusEl.style.visibility = 'hidden';
          chatStatusEl.textContent = '';
        });
      }

      if (chatInputEl && chatSendBtn) {
        chatInputEl.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' && !ev.shiftKey) {
            ev.preventDefault();
            chatSendBtn.click();
          }
        });
      }

      // Jangan langsung buka panel, hanya siapkan data ketika dibuka

    } catch (err) {
      console.error(err);
      Swal.fire('Error', `Gagal memuat detail toko (ID: ${shopId}): ${err.message}`, 'error');
    }
  };

  return html;
}
