# POSYANDU Backend Architecture

## 1. Overview

Backend POSYANDU menggunakan arsitektur REST API berbasis Node.js dan Express.

Struktur utama aplikasi memisahkan tanggung jawab menjadi:

```text
Request
  │
  ▼
Express Application
  │
  ▼
Routes
  │
  ├── Authentication
  ├── Authorization
  ├── Validation
  └── Privacy / Scope
  │
  ▼
Controllers
  │
  ▼
Helpers / Utilities
  │
  ▼
Sequelize Models
  │
  ▼
PostgreSQL
```

Entry point aplikasi berada pada:

```text
server.js
```

Route utama berada pada:

```text
routes/api.js
```

## 2. Layer Architecture

### 2.1 Application Layer

`server.js` bertanggung jawab terhadap bootstrap aplikasi:

- Memuat environment variable.
- Membuat Express application.
- Mengatur CORS.
- Mengaktifkan JSON dan URL-encoded body parser.
- Menyediakan static directory `/uploads`.
- Menyediakan endpoint `/health`.
- Mount API pada `/api`.
- Menangani 404.
- Menangani error middleware.
- Melakukan koneksi Sequelize sebelum server dijalankan.

Alur startup:

```text
server.js
   │
   ├── dotenv
   ├── CORS
   ├── body parser
   ├── /health
   ├── /api
   └── sequelize.authenticate()
             │
             ▼
        app.listen()
```

### 2.2 Routing Layer

`routes/api.js` mendefinisikan endpoint HTTP dan menghubungkan endpoint dengan controller.

Route dikelompokkan berdasarkan domain:

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

Route tidak berisi business logic utama. Route bertugas menyusun middleware dan menentukan controller yang menangani request.

Contoh pola:

```text
HTTP Request
    │
    ▼
Route
    │
    ├── authenticateToken
    ├── authorize(...)
    ├── validator
    ├── validateResult
    └── controller
```

## 3. Middleware Layer

Middleware digunakan sebelum request mencapai controller.

### 3.1 Authentication

`middleware/authMiddleware.js`

`authenticateToken`:

1. Membaca header `Authorization`.
2. Memastikan format Bearer token.
3. Memverifikasi JWT.
4. Mengambil user dari database.
5. Memeriksa `token_version`.
6. Memeriksa status user.
7. Memeriksa verifikasi email.
8. Menyimpan user terautentikasi pada request.

Pola:

```text
Authorization: Bearer <JWT>
             │
             ▼
      authenticateToken
             │
       JWT verify
             │
       load User
             │
    token_version check
             │
     active / verified
             │
             ▼
          req.user
```

### 3.2 Authorization

`authorize(...)` membatasi endpoint berdasarkan role.

Role yang digunakan:

```text
kader
puskesmas
puskesmasAdmin
dinkes
dinkesAdmin
sa
```

Role `sa` merupakan role canonical untuk super admin.

### 3.3 Data Privacy

`denyDinkesPersonalData` digunakan untuk endpoint yang tidak boleh memberikan data personal kepada role Dinkes.

Karena itu terdapat dua pola akses utama:

```text
authenticated
    │
    └── Role authenticated

personalAuthenticated
    │
    ├── authenticateToken
    ├── authorize(...)
    └── denyDinkesPersonalData
```

Endpoint agregat dapat menggunakan `authenticated` apabila memang tidak mengekspos data personal.

### 3.4 Validation

Request validation menggunakan:

```text
express-validator
```

Validator dikelompokkan berdasarkan domain:

```text
middleware/validators/
├── authValidators.js
├── common.js
├── imunisasiValidators.js
├── kehamilanValidator.js
├── kunjunganValidators.js
├── pemeriksaanValidators.js
├── posyanduValidators.js
├── rujukanValidators.js
├── sesiPosyanduValidators.js
├── userValidators.js
└── wargaValidators.js
```

`validationReporter.js` mengumpulkan hasil validasi sebelum controller dijalankan.

## 4. Controller Layer

Controller berisi request handling dan business logic domain.

```text
controllers/
├── authController.js
├── imunisasiController.js
├── kehamilanController.js
├── kunjunganController.js
├── pemeriksaanController.js
├── posyanduController.js
├── rujukanController.js
├── sesiPosyanduController.js
├── userController.js
└── wargaController.js
```

### Domain Mapping

| Domain | Controller |
|---|---|
| Authentication | `authController.js` |
| Posyandu | `posyanduController.js` |
| Warga | `wargaController.js` |
| Imunisasi | `imunisasiController.js` |
| Sesi Posyandu | `sesiPosyanduController.js` |
| User | `userController.js` |
| Kehamilan | `kehamilanController.js` |
| Kunjungan | `kunjunganController.js` |
| Pemeriksaan | `pemeriksaanController.js` |
| Rujukan | `rujukanController.js` |

Controller menggunakan model Sequelize dan helper ketika membutuhkan business rule yang dipisahkan dari request handling.

## 5. Utility / Business Helper Layer

Folder `utils/` berisi reusable business rules dan helper.

Komponen penting:

```text
utils/
├── auditLogHelper.js
├── detailSkriningHelper.js
├── examinationCompletionHelper.js
├── growthZScoreHelper.js
├── kategoriHelper.js
├── mailer.js
├── plotHelper.js
├── posyanduAccessHelper.js
├── pregnancyHelper.js
├── reference/
├── rujukanHelper.js
├── runtimeConfig.js
├── screeningEligibilityHelper.js
├── screeningScoringHelper.js
├── sesiPosyanduHelper.js
└── skriningChecker.js
```

### 5.1 Access Scope

`posyanduAccessHelper.js` menentukan scope data berdasarkan role.

Konsepnya:

```text
kader
  └── Posyandu milik user

puskesmas / puskesmasAdmin
  └── Posyandu di bawah Puskesmas user

dinkes / dinkesAdmin / sa
  └── tidak dibatasi oleh Posyandu
```

Helper ini digunakan bersama Sequelize `include` untuk menerapkan scope pada query.

### 5.2 Examination

Pemeriksaan menggunakan beberapa helper:

```text
kategoriHelper
detailSkriningHelper
screeningEligibilityHelper
screeningScoringHelper
growthZScoreHelper
plotHelper
rujukanHelper
examinationCompletionHelper
skriningChecker
```

Secara konseptual:

```text
Kunjungan
   │
   ▼
Pemeriksaan
   │
   ├── Step 1: Sasaran hadir
   │
   ├── Step 2: Pengukuran
   │       │
   │       └── Growth Z-Score
   │
   ├── Step 3: Plot
   │       │
   │       └── Evaluasi hasil pengukuran
   │
   ├── Step 4: Screening
   │       │
   │       ├── Eligibility
   │       ├── Detail screening
   │       ├── Scoring
   │       └── Riwayat tahunan
   │
   └── Step 5: Edukasi & Rujukan
           │
           ├── Plot referral reason
           ├── Screening referral reason
           ├── Manual referral reason
           └── Rujukan
```

### 5.3 Growth Reference

Referensi pertumbuhan berada pada:

```text
utils/reference/referenceTable.json
```

Adapter:

```text
utils/reference/referenceTableAdapter.js
```

Perhitungan digunakan oleh:

```text
utils/growthZScoreHelper.js
```

Controller pemeriksaan menggunakan helper tersebut untuk menghasilkan z-score yang disimpan pada data pemeriksaan.

### 5.4 Screening

Screening dibagi menjadi beberapa concern:

```text
Eligibility
    ↓
Detail Screening
    ↓
Scoring
    ↓
Annual Screening Check
    ↓
Referral Reason
```

Komponen:

- `screeningEligibilityHelper.js`
- `detailSkriningHelper.js`
- `screeningScoringHelper.js`
- `skriningChecker.js`
- `rujukanHelper.js`

### 5.5 Examination Completion

`examinationCompletionHelper.js` menyediakan aturan completion pemeriksaan berdasarkan timestamp penyelesaian step.

Konsepnya:

```text
Step 2 completed
       +
Step 4 completed
       +
Step 5 completed
       │
       ▼
Examination Complete
```

## 6. Data Access Layer

Sequelize digunakan sebagai ORM untuk berinteraksi dengan PostgreSQL.

Model berada pada:

```text
models/
```

Model utama:

```text
User
Puskesmas
Posyandu
Kecamatan
Kelurahan
Warga
ProfileKehamilan
SesiPosyandu
KunjunganPosyandu
Pemeriksaan
Imunisasi
Rujukan
AuditLog
EmailOtp
```

`models/index.js`:

1. Membaca file model.
2. Membuat instance model.
3. Menjalankan association.
4. Mengekspos instance Sequelize.

## 7. Relasi Domain Utama

Relasi utama aplikasi dapat digambarkan sebagai berikut:

```text
Kecamatan
   │
   └── Kelurahan
          │
          ├── Puskesmas
          │      │
          │      ├── Posyandu
          │      │      │
          │      │      ├── Warga
          │      │      │     ├── ProfileKehamilan
          │      │      │     ├── KunjunganPosyandu
          │      │      │     ├── Imunisasi
          │      │      │     └── Rujukan
          │      │      │
          │      │      └── SesiPosyandu
          │      │             │
          │      │             └── KunjunganPosyandu
          │      │                    │
          │      │                    └── Pemeriksaan
          │      │                           │
          │      │                           └── Rujukan
          │      │
          │      └── User
          │
          └── Posyandu
```

Beberapa relasi model yang didefinisikan di Sequelize:

```text
Kecamatan 1 ── * Kelurahan
Kelurahan 1 ── * Puskesmas
Kelurahan 1 ── * Posyandu

Puskesmas 1 ── * Posyandu
Puskesmas 1 ── * User
Puskesmas 1 ── * Rujukan

Posyandu 1 ── * Warga
Posyandu 1 ── * User
Posyandu 1 ── * SesiPosyandu

Warga 1 ── * ProfileKehamilan
Warga 1 ── * KunjunganPosyandu
Warga 1 ── * Imunisasi
Warga 1 ── * Rujukan

SesiPosyandu 1 ── * KunjunganPosyandu
KunjunganPosyandu 1 ── 1 Pemeriksaan
Pemeriksaan 1 ── 1 Rujukan
Pemeriksaan * ── 1 ProfileKehamilan
```

Detail schema dan migration berada di `docs/database.md`.

## 8. Authentication Flow

### Registration

```text
Client
  │
  ▼
POST /auth/register
  │
  ├── validate input
  ├── create User
  ├── email_verified = false
  ├── generate OTP
  └── send email
          │
          ▼
     POST /auth/verify-otp
          │
          ▼
     email_verified = true
```

Setelah itu proses approval user dapat dilakukan oleh role administrator sesuai authorization.

### Login

```text
POST /auth/login
       │
       ├── validate credential
       ├── check approval/status
       ├── check email verification
       ├── increment token version
       └── sign JWT
                │
                ▼
          Authorization Header
```

### Logout

Logout meningkatkan `token_version` user sehingga token dengan versi sebelumnya tidak lagi diterima oleh middleware authentication.

## 9. Request Lifecycle

Contoh request endpoint yang membutuhkan autentikasi:

```text
GET /api/warga
       │
       ▼
Express
       │
       ▼
authenticateToken
       │
       ▼
authorize(...)
       │
       ▼
denyDinkesPersonalData
       │
       ▼
validator.warga.listFilters
       │
       ▼
validateResult
       │
       ▼
wargaController.getAllWarga
       │
       ├── determine scope
       ├── build Sequelize query
       ├── load related data
       └── format response
       │
       ▼
JSON Response
```

## 10. Error Handling

`server.js` menyediakan global error middleware.

Pola response:

```json
{
  "success": false,
  "message": "..."
}
```

Error 4xx menggunakan `error.statusCode` apabila tersedia.

Error 5xx tidak mengekspos detail internal kepada client dan menggunakan pesan umum:

```text
Terjadi kesalahan pada server.
```

Endpoint yang tidak ditemukan mengembalikan:

```json
{
  "success": false,
  "message": "Endpoint tidak ditemukan."
}
```

## 11. Export Architecture

Export dilakukan pada beberapa domain.

### Sasaran

```text
wargaController
      │
      ▼
sasaranExportHelper
      │
      ▼
ExcelJS
      │
      ▼
.xlsx
```

Kolom export dapat disesuaikan berdasarkan kategori sasaran.

### Pemeriksaan / Rekap

```text
pemeriksaanController
      │
      ▼
rekapExportHelper
      │
      ▼
aggregateRekapRows
      │
      ▼
ExcelJS
      │
      ▼
.xlsx
```

Export rekap menggunakan data agregat sesuai kebutuhan endpoint.

### Rujukan

```text
rujukanController
      │
      ▼
PDFKit
      │
      ▼
.pdf
```

## 12. Audit Logging

Perubahan data penting menggunakan:

```text
utils/auditLogHelper.js
```

Model:

```text
models/audit_log.js
```

Audit log memiliki relasi ke `User` sebagai actor.

Konsep:

```text
Authenticated User
       │
       ▼
Controller mutation
       │
       ├── database change
       │
       └── createAuditLog(...)
                    │
                    ▼
                AuditLog
```

## 13. Database Migration

Schema database dikelola melalui Sequelize migration.

```text
migrations/
```

Migration mencakup pembuatan tabel utama serta perubahan schema seperti:

- token version.
- penyesuaian role.
- atribut profil kehamilan.
- lokasi dan RW sesi Posyandu.
- tabel imunisasi.
- tabel rujukan.
- growth z-score.
- referral attendance.
- screening history.
- email verification.
- examination completion timestamp.
- constraint satu kehamilan aktif.
- backfill email verification.

Detail seluruh migration dan schema berada di:

```text
docs/database.md
```

## 14. Configuration

Konfigurasi Sequelize berada di:

```text
config/config.js
```

Environment dibaca dari `.env`.

Development dan test menggunakan:

```text
timestamps: false
underscored: true
freezeTableName: true
timezone: +07:00
```

Production menggunakan connection pool:

```text
max: 10
min: 2
acquire: 30000
idle: 10000
```

Runtime configuration tambahan berada pada:

```text
utils/runtimeConfig.js
```

## 15. Security Boundaries

Security pada aplikasi dibangun dari beberapa lapisan:

```text
JWT Authentication
       +
Role Authorization
       +
Posyandu/Puskesmas Scope
       +
Dinkes Personal Data Restriction
       +
Request Validation
       +
Password Hashing
       +
Token Version Invalidation
       +
Audit Logging
```

Tidak semua endpoint menggunakan seluruh lapisan tersebut. Middleware dipasang berdasarkan kebutuhan endpoint.

## 16. Related Documentation

| Dokumen | Fokus |
|---|---|
| `README.md` | Overview, instalasi, konfigurasi, dan penggunaan project |
| `docs/database.md` | Schema database, relasi, constraint, dan migration |
| `apiDocs.md` | Endpoint API |
| `docs/API.md` | Dokumentasi API pada folder docs |
| `openapi.yaml` | Spesifikasi OpenAPI |

