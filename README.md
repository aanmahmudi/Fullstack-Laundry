# BE-Laundry Monorepo

Struktur proyek telah ditata ulang menjadi dua folder: `backend/` untuk aplikasi Spring Boot dan `frontend/` untuk UI sederhana HTML/CSS/JS yang terhubung ke API.

## Struktur
- `backend/` — Aplikasi Spring Boot (Dockerfile, Maven, src, uploads)
- `frontend/` — Halaman HTML statis dengan form untuk Produk, Customer, Transaksi, dan Login
- `docker-compose.yml` — Menjalankan Postgres dan backend dalam container

## Menjalankan Backend (Docker)
Prasyarat: Docker & Docker Compose.

1. Dari root proyek, jalankan:
   - `docker compose up -d --build`
2. Layanan yang aktif:
   - API backend: `http://localhost:8080`
   - Postgres: `localhost:5432` (user: `subrutin`, password: `subrutin`, db: `db-laundry`)

Catatan: Dockerfile backend melakukan build Maven di tahap builder, lalu menjalankan jar dengan profile `docker`.

## Menjalankan Frontend (SPA Terstruktur)
Prasyarat: Node.js (v18+). Frontend sekarang Single Page Application (SPA) dengan router hash-based.

Struktur utama:
- `frontend/index.html` — Shell aplikasi (header, main, footer)
- `frontend/js/api.js` — Helper panggilan API (global `window.API`)
- `frontend/app/core/router.js` — Router sederhana untuk `#/route`
- `frontend/app/core/state.js` — State ringan (keranjang, user) via `localStorage`
- `frontend/app/components/header.js` — Header reusable dengan navigasi & badge keranjang
- `frontend/app/pages/*` — Halaman modular: `home.js`, `products.js`, `product-detail.js`, `cart.js`, `checkout.js`, `orders.js`, `auth.js`
- `frontend/assets/styles.css` — Style modern (dark, grid, cards)

Menjalankan server statis:
1. Dari root proyek jalankan:
   - `npx http-server ./frontend -p 5500 -c-1`
2. Buka `http://127.0.0.1:5500/`
   - Navigasi via hash: `#/products`, `#/product/ID`, `#/cart`, `#/checkout`, `#/orders`, `#/auth`

Frontend menggunakan `API_BASE = http://localhost:8080` dan memanggil endpoint berikut:
- `GET /api/products`, `POST /api/products`
- `GET /api/customers`, `POST /api/customers/register`, `POST /api/customers/login`
- `GET /api/transactions`, `POST /api/transactions`, `POST /api/transactions/payment`

## Catatan Vite/React
Jika ingin frontend React+Vite, gunakan Node.js `>=20.19.0` agar kompatibel dengan `create-vite@8.x`, lalu:
- `npm create vite@latest frontend -- --template react`
- `cd frontend && npm install && npm run dev`

## Pengembangan
- Perubahan API di backend langsung berdampak ke frontend (lihat file di `frontend/js/pages/*`).
- Ubah `API_BASE` di `frontend/js/api.js` jika backend berjalan di host/port berbeda.

## Troubleshooting
- Port `5173` sering dipakai; gunakan `-p 5500` untuk http-server.
- Jika `http-server` belum terpasang, `npx` akan memasang otomatis saat dijalankan pertama kali.