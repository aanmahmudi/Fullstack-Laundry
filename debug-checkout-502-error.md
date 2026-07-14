[OPEN]

# Debug Session: checkout-502-error

## Symptom
- Saat checkout `POST /api/transactions` dari frontend, dapat `502 Bad Gateway`.
- Log nginx: `connect() failed (111: Connection refused) while connecting to upstream ... order-service ...`
- Container `order-service` exit dengan code 1.

## Expected
- Endpoint `POST /api/transactions` berhasil diproses oleh order-service dan mengembalikan 2xx.

## Hypotheses (Falsifiable)
- **A (Order-service crash on startup)**: order-service mati karena exception saat startup (DB connection, config invalid, migration, dll).
- **B (DB connection failed)**: order-service tidak bisa connect ke `order-db` (URL/port/credential) sehingga exit.
- **C (Nginx upstream mismatch)**: nginx route `/api/transactions` menuju host/port yang salah atau service name salah.
- **D (Runtime env mismatch)**: order-service pakai profile/env yang tidak sesuai (misal baca `localhost` di dalam container).
- **E (Dependency failure)**: order-service gagal karena dependency (Kafka/Identity/Catalog) tidak reachable pada startup.

## Evidence Plan
1. Ambil stacktrace lengkap dari `docker logs order-service`.
2. Cek status container `order-db` dan konektivitas dari order-service.
3. Validasi konfigurasi nginx upstream untuk `/api/transactions`.
4. Re-run setelah perbaikan dan bandingkan log pre vs post.

