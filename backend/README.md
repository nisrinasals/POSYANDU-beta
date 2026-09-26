# POSYANDU Backend

Backend REST API untuk sistem pengelolaan data Posyandu ILP. Aplikasi dibangun menggunakan Node.js, Express, Sequelize, dan PostgreSQL.

## Daftar Isi

- [Overview](#overview)
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Struktur Project](#struktur-project)
- [Role](#role)
- [Alur Utama](#alur-utama)
- [Persyaratan](#persyaratan)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Instalasi](#instalasi)
- [Menjalankan Server](#menjalankan-server)
- [Database dan Migration](#database-dan-migration)
- [Testing](#testing)
- [Endpoint](#endpoint)
- [Dokumentasi](#dokumentasi)
- [Catatan Keamanan dan Privasi](#catatan-keamanan-dan-privasi)

## Overview

Backend POSYANDU menyediakan REST API untuk mendukung pengelolaan data Posyandu, sasaran/warga, sesi pelayanan, kunjungan, pemeriksaan, screening, imunisasi, kehamilan, dan rujukan.

API menggunakan autentikasi JWT dan authorization berbasis role. Akses data juga dibatasi berdasarkan scope Posyandu atau Puskesmas sesuai role pengguna.

Base URL saat development:

```text
http://localhost:3000/api
```

Health check:

```text
GET /health
```

Response berhasil menunjukkan bahwa API aktif.

## Fitur

### Authentication

- Registrasi akun.
- Verifikasi email menggunakan OTP.
- Resend OTP dengan cooldown.
- Login menggunakan JWT.
- Request reset password.
- Reset password menggunakan OTP.
- Logout dan invalidasi token melalui `token_version`.

### Manajemen Wilayah dan Posyandu

- Melihat daftar Posyandu.
- Melihat detail Posyandu.
- Scope data berdasarkan Posyandu/Puskesmas.

### Manajemen Sasaran/Warga

- Daftar warga.
- Detail warga.
- Tambah dan edit warga.
- Status domisili: `aktif`, `pindah`, `meninggal`.
- Mutasi warga antar Posyandu dengan verifikasi identitas.
- Statistik sasaran.
- Export data sasaran ke Excel dengan kolom yang menyesuaikan kategori.

Kategori sasaran yang digunakan:

```text
bumil
busui
bayi
balita
apras
uskrem_6_14
uskrem_15_18
dewasa
lansia
```

### Sesi Posyandu

- Membuat sesi Posyandu.
- Melihat sesi.
- Mengubah informasi sesi.
- Mengubah status sesi.
- Pengelolaan akses berdasarkan Posyandu dan role.

### Kunjungan

- Membuat kunjungan.
- Membuat nomor antrean.
- Melihat antrean hari ini.
- Melihat daftar/detail kunjungan.
- Memperbarui status langkah.
- Menghapus kunjungan sesuai authorization.

### Pemeriksaan

Pemeriksaan menggunakan alur multi-step:

1. Memilih sasaran yang hadir.
2. Menyimpan pengukuran.
3. Menghasilkan/menampilkan hasil plot berdasarkan pengukuran dan z-score.
4. Mengisi screening sesuai kategori dan eligibility.
5. Menyelesaikan edukasi serta menentukan rujukan.

Pemeriksaan juga mendukung:

- Validasi pengukuran.
- Perhitungan growth z-score.
- Referensi pertumbuhan.
- Screening scoring.
- Riwayat screening tahunan.
- Deteksi alasan rujukan dari hasil screening dan plot.
- Export rekap pemeriksaan.
- Completion timestamp untuk langkah pemeriksaan tertentu.

### Kehamilan

- Membuat profil kehamilan.
- Melihat profil kehamilan.
- Mengubah profil/status kehamilan.
- Validasi HPHT, HPL, tanggal persalinan, dan kombinasi status.
- Pencegahan lebih dari satu kehamilan aktif untuk satu warga.

### Imunisasi

- Melihat imunisasi berdasarkan warga.
- Melihat detail imunisasi.
- Menambah imunisasi.
- Mengubah imunisasi.

Tanggal imunisasi disimpan sebagai field `DATEONLY` pada tabel `imunisasi`.

### Rujukan

- Melihat daftar rujukan.
- Melihat detail rujukan.
- Export detail rujukan ke PDF.
- Pembuatan/pembaruan rujukan dilakukan sebagai bagian dari proses pemeriksaan Step 5 berdasarkan hasil screening, plot, atau alasan rujukan manual.

### Audit Log

Perubahan data penting dicatat melalui audit log untuk mendukung pelacakan aktivitas.

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Runtime | Node.js |
| Web Framework | Express 5 |
| ORM | Sequelize 6 |
| Database | PostgreSQL |
| Authentication | JWT |
| Password Hashing | bcryptjs |
| Validation | express-validator |
| Email | Nodemailer |
| Excel Export | ExcelJS |
| PDF Export | PDFKit |
| Upload | Multer |
| Testing | Node Test Runner + Supertest |
| Development | Nodemon |

## Struktur Project

```text
.
├── config/
│   └── config.js
├── controllers/
│   ├── authController.js
│   ├── imunisasiController.js
│   ├── kehamilanController.js
│   ├── kunjunganController.js
│   ├── pemeriksaanController.js
│   ├── posyanduController.js
│   ├── rujukanController.js
│   ├── sesiPosyanduController.js
│   ├── userController.js
│   └── wargaController.js
├── docs/
│   ├── API.md
│   ├── API.md
│   └── database.md
├── middleware/
│   ├── authMiddleware.js
│   ├── uploadProfilePicture.js
│   ├── validationReporter.js
│   └── validators/
├── migrations/
├── models/
├── routes/
│   └── api.js
├── utils/
│   ├── export/
│   └── reference/
├── .env.example
├── apiDocs.md
├── openapi.yaml
├── package.json
└── server.js
```

## Role

Role yang digunakan:

| Role | Scope / fungsi umum |
|---|---|
| `kader` | Operasional data sasaran dan pelayanan Posyandu pada Posyandu yang menjadi scope-nya |
| `puskesmas` | Akses pada scope Puskesmas |
| `puskesmasAdmin` | Administrasi pengguna dan data pada scope Puskesmas |
| `dinkes` | Akses data agregat dan fungsi yang tidak mengekspos data personal tertentu |
| `dinkesAdmin` | Administrasi pada level Dinkes |
| `sa` | Super admin dengan privilege tertinggi |

Istilah bisnis `superAdmin` mengacu pada role canonical `sa`, bukan role terpisah.

## Alur Utama

Secara umum request diproses melalui:

```text
Client
  │
  ▼
Express
  │
  ├── CORS
  ├── JSON / URL-encoded parser
  └── /api
        │
        ▼
      Route
        │
        ├── Authentication
        ├── Authorization
        ├── Validation
        └── Data privacy / scope
              │
              ▼
          Controller
              │
              ▼
        Helper / Utility
              │
              ▼
          Sequelize
              │
              ▼
         PostgreSQL
```

Detail arsitektur tersedia pada [architecture.md](docs/architecture.md).

## Persyaratan

Pastikan tersedia:

- Node.js.
- npm.
- PostgreSQL.

Versi package yang digunakan dapat dilihat pada `package.json`.

## Konfigurasi Environment

Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Pada Windows, file `.env` dapat dibuat/disalin secara manual.

Variabel utama:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=posyandu
DB_USER=postgres
DB_PASSWORD=change-me
DB_DIALECT=postgres

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d

OTP_EXPIRES_MINUTES=10
OTP_RESEND_COOLDOWN_MINUTES=1

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASSWORD=change-me
SMTP_FROM=no-reply@example.com

CORS_ORIGIN=http://localhost:3000
```

### Production

Saat `NODE_ENV=production`, konfigurasi production harus menyediakan nilai environment yang diperlukan. Jangan menggunakan placeholder untuk secret, database, SMTP, atau konfigurasi CORS.

`CORS_ORIGIN` dapat berisi beberapa origin yang dipisahkan koma.

## Instalasi

Install dependency:

```bash
npm install
```

Jalankan migration:

```bash
npx sequelize-cli db:migrate --env development
```

Kemudian jalankan server:

```bash
npm start
```

Untuk development dengan Nodemon:

```bash
npm run dev
```

## Database dan Migration

Database menggunakan PostgreSQL dengan Sequelize.

Migration tersedia di folder:

```text
migrations/
```

Migration digunakan untuk membuat dan memperbarui schema database secara bertahap.

Untuk melihat struktur database lengkap, relasi tabel, constraint, index, dan migration:

- [database.md](docs/database.md)

Rollback migration terakhir:

```bash
npx sequelize-cli db:migrate:undo --env development
```

Perintah migration lain dapat menggunakan Sequelize CLI sesuai kebutuhan environment.

## Testing

Script `package.json` menyediakan:

```bash
npm test
```

Script tersebut menjalankan:

```bash
node --test tests/*.test.js
```

Jika folder atau file test tidak tersedia pada checkout saat ini, command tersebut tidak dapat menemukan test file. Dokumentasi ini tidak mengasumsikan hasil test tertentu.

## Endpoint

Seluruh route API didefinisikan di:

```text
routes/api.js
```

Kelompok endpoint:

```text
/auth
/posyandu
/warga
/imunisasi
/sesi-posyandu
/users
/kehamilan
/kunjungan
/pemeriksaan
/rujukan
```

Dokumentasi endpoint lengkap:

- [apiDocs.md](apiDocs.md)
- [API.md](docs/API.md)
- [openapi.yaml](openapi.yaml)

## Dokumentasi

| Dokumen | Isi |
|---|---|
| `README.md` | Overview dan cara menjalankan project |
| `architecture.md` | Arsitektur aplikasi dan alur request |
| `docs/database.md` | Struktur database dan migration |
| `apiDocs.md` | Dokumentasi endpoint API |
| `docs/API.md` | Dokumentasi API pada folder docs |
| `openapi.yaml` | Spesifikasi OpenAPI |

## Catatan Keamanan dan Privasi

### Authentication

Endpoint yang membutuhkan login menggunakan JWT melalui header:

```http
Authorization: Bearer <token>
```

Token diverifikasi oleh `authenticateToken`.

Selain validasi signature dan expiry JWT, token juga dibandingkan dengan `token_version` pada database. Perubahan `token_version` dapat membuat token sebelumnya tidak lagi valid.

### Authorization

Role divalidasi melalui middleware `authorize`.

Selain role, controller/helper menerapkan scope berdasarkan:

- `posyandu_id`
- `puskesmas_id`

### Data Personal Dinkes

API membedakan endpoint yang dapat mengakses data personal dan endpoint yang dapat diakses oleh role Dinkes.

Endpoint data personal menggunakan middleware `denyDinkesPersonalData`, sedangkan endpoint tertentu seperti statistik dan export rekap menggunakan akses yang sesuai dengan kebutuhan agregasi.

Prinsip ini mencegah role Dinkes memperoleh data personal melalui endpoint yang memang dibatasi untuk data operasional.

### Validation

Request divalidasi melalui `express-validator` sebelum masuk ke controller.

Validator tersedia di:

```text
middleware/validators/
```

### Secret

File `.env` tidak boleh dimasukkan ke repository. Gunakan `.env.example` sebagai template konfigurasi.

---

## Related Documentation

- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [API Documentation](apiDocs.md)
- [OpenAPI Specification](openapi.yaml)
