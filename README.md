# POSYANDU Backend

Backend REST API untuk pengelolaan data Posyandu ILP menggunakan Node.js, Express, Sequelize, dan PostgreSQL.

## Menjalankan

1. Install dependency:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env`, lalu isi database, JWT, SMTP, dan `CORS_ORIGIN` sesuai environment. Jangan gunakan placeholder pada production; `JWT_SECRET`, koneksi database, SMTP, dan `CORS_ORIGIN` wajib tersedia saat `NODE_ENV=production`.
3. Jalankan migration:

   ```bash
   npx sequelize-cli db:migrate --env development
   ```

4. Jalankan server:

   ```bash
   npm start
   ```

API tersedia di `http://localhost:3000/api`. Health check tersedia di `/health`.

`CORS_ORIGIN` menerima satu atau beberapa origin yang dipisahkan koma. Pada development, nilai kosong mengizinkan request browser dari origin mana pun dan tetap menerima request tanpa header `Origin`; pada production origin harus ditentukan secara eksplisit. `OTP_EXPIRES_MINUTES` dan `OTP_RESEND_COOLDOWN_MINUTES` mengatur masa berlaku serta jeda pengiriman ulang OTP.

## Fitur

- Auth, OTP, reset password, dan logout JWT.
- Manajemen Posyandu, Warga, mutasi domisili, dan statistik sasaran.
- Sesi Posyandu dan kunjungan.
- Profil kehamilan dan imunisasi.
- Pemeriksaan multi-step dengan screening, scoring, dan finalisasi.
- Rujukan dari keputusan Step 5 atau trigger screening.
- Daftar/detail Rujukan dan export PDF.
- Audit log untuk perubahan data penting.

## Role

Role dengan privilege tertinggi menggunakan nilai canonical `sa`. Istilah bisnis `superAdmin` merujuk pada role yang sama dan bukan nilai role kedua. Role lain: `kader`, `puskesmas`, `puskesmasAdmin`, `dinkes`, dan `dinkesAdmin`.

## Testing

```bash
npm test
```

Test mencakup controller, alur pemeriksaan/Rujukan, authorization scope, dan HTTP integration test dengan Supertest.

## Dokumentasi API

Lihat [docs/API.md](docs/API.md) untuk route, authorization, response error, dan export PDF Rujukan.
