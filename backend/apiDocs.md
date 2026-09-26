# POSYANDU API Documentation

## Base URL

```text
/api
```

## Authentication

Protected endpoints menggunakan:

```http
Authorization: Bearer <JWT>
```

JWT divalidasi terhadap `token_version`, status akun, dan verifikasi email.

### Roles

- `kader`
- `puskesmas`
- `puskesmasAdmin`
- `dinkes`
- `dinkesAdmin`
- `sa`

`sa` melewati pemeriksaan role pada middleware `authorize`.

### Akses data personal

Endpoint dengan `personalAuthenticated` menggunakan `denyDinkesPersonalData`, sehingga `dinkes` tidak dapat mengakses data personal dan mendapat:

```json
{
  "success": false,
  "message": "Role dinkes hanya dapat mengakses data agregat."
}
```

Endpoint agregat seperti statistik sasaran dan rekap pemeriksaan tetap dapat digunakan oleh role yang diizinkan.

## Standard Validation Error

Jika validator Express gagal:

```json
{
  "status": "error",
  "message": "Validasi data gagal",
  "errors": [
    {
      "field": "nama_field",
      "message": "pesan validasi"
    }
  ]
}
```

---

# 1. Authentication

## POST /auth/register

Self-register untuk role `dinkes`, `puskesmas`, atau `kader`.

### Body

```json
{
  "role": "kader",
  "email": "kader@example.com",
  "password": "password",
  "nama_lengkap": "Nama Kader",
  "telepon": "081234567890",
  "nik": "327xxxxxxxxxxxxx",
  "puskesmas_id": 1,
  "posyandu_id": 1
}
```

### Success 201

```json
{
  "success": true,
  "message": "Registrasi berhasil. Silakan cek email kamu untuk verifikasi kode OTP.",
  "data": {
    "id": 1,
    "email": "kader@example.com",
    "role": "kader",
    "status": "pending_approval"
  }
}
```

### Errors

- `400` — `Email atau NIK sudah terdaftar dalam sistem.`
- `403` — `Role tersebut tidak dapat melakukan self-register.`

## POST /auth/verify-otp

### Body

```json
{
  "email": "kader@example.com",
  "otp_code": "123456",
  "purpose": "register"
}
```

### Success — register

```json
{
  "success": true,
  "message": "Verifikasi email berhasil. Akun kamu saat ini menunggu persetujuan (approval) dari admin."
}
```

### Success — other OTP purpose

```json
{
  "success": true,
  "message": "Verifikasi OTP berhasil."
}
```

### Error

`400` — `Kode OTP tidak valid atau sudah kedaluwarsa.`

## POST /auth/resend-otp

### Body

```json
{
  "email": "kader@example.com",
  "purpose": "register"
}
```

### Success

```json
{
  "success": true,
  "message": "Kode OTP baru telah dikirimkan ke email kamu."
}
```

### Errors

- `400` — `Purpose OTP tidak valid.`
- `429` — `Silakan tunggu <menit> menit sebelum meminta kode OTP baru.`

## POST /auth/login

### Body

```json
{
  "email": "kader@example.com",
  "password": "password"
}
```

### Success

`200` — response berisi JWT dan informasi user dari controller login.

### Errors

- `401` — `Email atau password salah.`
- `403` — akun masih `pending_approval`.
- `403` — `Email belum diverifikasi.`
- `403` — akun tidak aktif.

## POST /auth/request-reset-password

Meminta OTP reset password.

### Body

```json
{
  "email": "kader@example.com"
}
```

### Success

Response sukses dari controller request reset password.

## POST /auth/reset-password

### Body

```json
{
  "email": "kader@example.com",
  "otp_code": "123456",
  "password": "password-baru"
}
```

### Success

Response sukses dari controller reset password.

## POST /auth/logout

JWT diperlukan.

### Success

Response sukses dari controller logout. `token_version` user dinaikkan sehingga token sebelumnya tidak berlaku.

---

# 2. Posyandu

## GET /posyandu

### Query

- `page`
- `limit`
- `search`
- `puskesmas_id`
- `kecamatan_id`

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil daftar Posyandu.",
  "data": [],
  "pagination": {
    "total_items": 0,
    "total_pages": 0,
    "current_page": 1,
    "items_per_page": 10
  }
}
```

## GET /posyandu/:id

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil detail Posyandu.",
  "data": {}
}
```

### Error

`404` — `Data Posyandu tidak ditemukan.`

---

# 3. Warga

Endpoint data personal memakai `personalAuthenticated`.

## GET /warga

### Query

- `page`
- `limit`
- `search`
- `posyandu_id`
- `jenis_kelamin`
- `kategori_sasaran`
- `category`
- `status_domisili`
- `rt`
- `rw`

Kategori:

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

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil data warga / sasaran.",
  "data": {},
  "pagination": {
    "total_items": 0,
    "total_pages": 0,
    "current_page": 1,
    "items_per_page": 10
  }
}
```

Item warga memuat field Warga serta `umur_text`, `usia_bulan`, `usia_tahun`, dan `kategori_sasaran_saat_ini`.

### Error

`400` — `Kategori sasaran tidak valid. Pilihan: bumil, busui, bayi, balita, apras, uskrem_6_14, uskrem_15_18, dewasa, lansia`

## GET /warga/export

### Query

- `posyandu_id`
- `kategori_sasaran`
- `category`
- `status_domisili`
- `search`

### Response

Excel dengan:

```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename=Data_Warga_ILP_YYYY-MM-DD.xlsx
```

Kolom export menyesuaikan kategori sasaran.

## GET /warga/statistik-sasaran

Endpoint agregat.

### Success 200

```json
{
  "success": true,
  "message": "Berhasil merekap statistik sasaran ILP.",
  "data": {}
}
```

## GET /warga/:id

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil detail data warga.",
  "data": {}
}
```

### Error

`404` — `Data warga tidak ditemukan atau Anda tidak memiliki hak akses.`

## POST /warga

### Body

```json
{
  "nik": "327xxxxxxxxxxxxx",
  "nama_lengkap": "Nama Warga",
  "jenis_kelamin": "P",
  "tanggal_lahir": "2000-01-01",
  "alamat": "Alamat",
  "rt": "001",
  "rw": "002",
  "telepon": "081234567890",
  "nama_ibu": "Nama Ibu",
  "nama_ayah": "Nama Ayah",
  "status_perkawinan": "tidak_menikah",
  "pekerjaan": "Pelajar",
  "pekerjaan_lainnya": null,
  "posyandu_id": 1,
  "bb_lahir_kg": 3.2,
  "tb_lahir_cm": 49,
  "status_domisili": "aktif"
}
```

### Success 201

```json
{
  "success": true,
  "message": "Berhasil menambahkan data warga [Nama].",
  "data": {}
}
```

### Errors

- `400` — `tanggal_lahir tidak boleh di masa depan.`
- `400` — `NIK harus terdiri dari 16 digit angka.`
- `400` — nilai jenis kelamin/status perkawinan/status domisili tidak valid.
- `404` — `Data Posyandu tidak ditemukan atau di luar scope Anda.`
- `409` — NIK sudah terdaftar.

Role `puskesmas`, `puskesmasAdmin`, `dinkes`, dan `dinkesAdmin` bersifat read-only.

## PUT /warga/:id

### Body

```text
nik
nama_lengkap
jenis_kelamin
tanggal_lahir
alamat
rt
rw
telepon
nama_ibu
nama_ayah
status_perkawinan
pekerjaan
pekerjaan_lainnya
bb_lahir_kg
tb_lahir_cm
status_domisili
```

### Success 200

```json
{
  "success": true,
  "message": "Data warga berhasil diperbarui.",
  "data": {}
}
```

### Errors

- `403` — role read-only.
- `403` — Kader tidak berhak mengubah warga Posyandu lain.
- `404` — warga tidak ditemukan.
- `400` — validasi data gagal.
- `409` — NIK sudah digunakan warga lain.

## PATCH /warga/:id/status-domisili

### Body

```json
{
  "status_domisili": "pindah"
}
```

Nilai: `aktif`, `pindah`, `meninggal`.

### Success 200

```json
{
  "success": true,
  "message": "Status domisili warga [Nama] berhasil diubah menjadi [status].",
  "data": {
    "id": 1,
    "nama_lengkap": "Nama Warga",
    "status_domisili": "pindah"
  }
}
```

## POST /warga/mutasi/verify

### Body

```json
{
  "nik": "327xxxxxxxxxxxxx",
  "nama_lengkap": "Nama Warga",
  "nama_ibu": "Nama Ibu"
}
```

### Success 200

```json
{
  "success": true,
  "message": "Data warga ditemukan. Silakan konfirmasi mutasi.",
  "data": {
    "id": 1,
    "nik": "327xxxxxxxxxxxxx",
    "nama_lengkap": "Nama Warga",
    "nama_ibu": "Nama Ibu",
    "posyandu_saat_ini": {},
    "posyandu_tujuan": {
      "id": 2,
      "nama_posyandu": "Posyandu Tujuan",
      "puskesmas_id": 1
    }
  }
}
```

## PATCH /warga/mutasi/confirm

### Body

```json
{
  "warga_id": 1,
  "nik": "327xxxxxxxxxxxxx",
  "nama_lengkap": "Nama Warga",
  "nama_ibu": "Nama Ibu"
}
```

### Success 200

```json
{
  "success": true,
  "message": "Warga berhasil dimutasi ke Posyandu tujuan.",
  "data": {
    "id": 1,
    "nik": "327xxxxxxxxxxxxx",
    "nama_lengkap": "Nama Warga",
    "posyandu_id": 2
  }
}
```

---

# 4. Imunisasi

## GET /imunisasi/warga/:warga_id

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil data imunisasi warga.",
  "data": []
}
```

## GET /imunisasi/:id

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil detail imunisasi.",
  "data": {}
}
```

## POST /imunisasi

### Body

```json
{
  "warga_id": 1,
  "jenis_imunisasi": "BCG",
  "tanggal_imunisasi": "2026-01-01"
}
```

### Success 201

```json
{
  "success": true,
  "message": "Data imunisasi berhasil ditambahkan.",
  "data": {}
}
```

## PUT /imunisasi/:id

### Body

```json
{
  "jenis_imunisasi": "BCG",
  "tanggal_imunisasi": "2026-01-01"
}
```

### Success 200

```json
{
  "success": true,
  "message": "Data imunisasi berhasil diperbarui.",
  "data": {}
}
```

---

# 5. Sesi Posyandu

## GET /sesi-posyandu

### Query

- `page`
- `limit`
- `posyandu_id`
- `status`
- `tanggal`

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil sesi Posyandu.",
  "data": [],
  "pagination": {
    "total_items": 0,
    "total_pages": 0,
    "current_page": 1,
    "items_per_page": 10
  }
}
```

## GET /sesi-posyandu/:id

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil detail sesi Posyandu.",
  "data": {}
}
```

### Error

`404` — `Sesi Posyandu tidak ditemukan atau akses ditolak.`

## POST /sesi-posyandu

### Body

```json
{
  "posyandu_id": 1,
  "tanggal_pelaksanaan": "2026-09-25",
  "lokasi": "Balai Desa",
  "rw": "002",
  "status": "open"
}
```

### Success 201

```json
{
  "success": true,
  "message": "Sesi Posyandu berhasil dibuat.",
  "data": {}
}
```

### Errors

- `403` — `Posyandu berada di luar scope Anda.`
- `409` — `Sudah ada sesi pada Posyandu dan tanggal tersebut.`

## PUT /sesi-posyandu/:id

Body mengikuti field sesi yang dapat diperbarui.

### Success 200

```json
{
  "success": true,
  "message": "Sesi Posyandu berhasil diperbarui.",
  "data": {}
}
```

### Errors

- `400` — sesi closed tidak dapat diedit.
- `403` — Posyandu di luar scope.
- `404` — sesi tidak ditemukan.
- `409` — sesi pada Posyandu/tanggal sudah ada.

## PATCH /sesi-posyandu/:id/status

### Body

```json
{
  "status": "closed"
}
```

Status: `open`, `closed`.

### Success 200

```json
{
  "success": true,
  "message": "Status sesi Posyandu berhasil diperbarui.",
  "data": {}
}
```

---

# 6. User Administration

## PATCH /users/:id/verify

Role: `puskesmasAdmin`, `dinkesAdmin`, `sa`.

Memverifikasi/approve user.

## PATCH /users/:id/deactivate

Role: `puskesmasAdmin`, `dinkesAdmin`, `sa`.

Menonaktifkan user.

## PUT /users/:id/puskesmas-admin

Role: `dinkesAdmin`, `sa`.

Mengatur user sebagai admin Puskesmas.

## PUT /users/:id/dinkes-admin

Role: `dinkesAdmin`, `sa`.

Mengatur user sebagai admin Dinkes.

## GET /users/me

JWT diperlukan. Mengembalikan profile user aktif.

## PATCH /users/me

### Body

Mengikuti validator `updateMyProfile`.

## POST /users/me/profile-picture

JWT + multipart upload melalui `uploadProfilePicture`.

## GET /users

Role: `puskesmasAdmin`, `dinkesAdmin`, `sa`.

### Query

Mengikuti validator `getUsers`.

## GET /users/:id

Role: `puskesmasAdmin`, `dinkesAdmin`, `sa`.

## PATCH /users/:id/role

Role: `sa`.

Mengubah role user.

## PATCH /users/:id/status

Role: `puskesmasAdmin`, `dinkesAdmin`, `sa`.

Mengubah status user.

---

# 7. Kehamilan

## GET /kehamilan/warga/:warga_id

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil data kehamilan warga.",
  "data": []
}
```

## GET /kehamilan/:id

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil detail data kehamilan.",
  "data": {}
}
```

## POST /kehamilan

### Body

Field:

```text
warga_id
nama_suami
hpht
hpl
anak_ke
jarak_anak_sebelum_bulan
tanggal_persalinan
cara_persalinan
status_kehamilan
is_menyusui
```

Default:

```text
status_kehamilan = hamil
is_menyusui = false
```

### Success 201

```json
{
  "success": true,
  "message": "Data kehamilan berhasil ditambahkan.",
  "data": {}
}
```

### Validation

- `status_kehamilan`: `hamil`, `nifas`, `menyusui`, `selesai`.
- `is_menyusui=true` hanya untuk `menyusui`.
- `menyusui` wajib `is_menyusui=true`.
- `nifas`/`menyusui` wajib `tanggal_persalinan`.
- `hamil` tidak boleh memiliki `tanggal_persalinan`.
- `hpl >= hpht`.
- `tanggal_persalinan >= hpht`.
- Satu warga tidak boleh mempunyai lebih dari satu profile `hamil` aktif.

## PUT /kehamilan/:id

Mengubah profile kehamilan.

Kehamilan dengan status `nifas`, `menyusui`, atau `selesai` tidak boleh diubah kembali menjadi `hamil`.

### Success 200

```json
{
  "success": true,
  "message": "Data kehamilan berhasil diperbarui.",
  "data": {}
}
```

## PATCH /kehamilan/:id/status

### Body

```json
{
  "status_kehamilan": "menyusui",
  "is_menyusui": true,
  "tanggal_persalinan": "2026-08-01"
}
```

### Success 200

```json
{
  "success": true,
  "message": "Status kehamilan berhasil diperbarui.",
  "data": {}
}
```

---

# 8. Kunjungan

## POST /kunjungan

### Body

```json
{
  "warga_id": 1,
  "sesi_posyandu_id": 1
}
```

### Success 201

```json
{
  "success": true,
  "message": "Berhasil mendaftarkan [Nama Warga] ke Step 1 (Meja Pendaftaran).",
  "data": {
    "kunjungan_id": 1,
    "nomor_antrean": "A-001",
    "status_langkah": "langkah_1",
    "warga": {
      "id": 1,
      "nama_lengkap": "Nama Warga",
      "nik": "327xxxxxxxxxxxxx"
    }
  }
}
```

### Errors

- `404` — sesi tidak ditemukan.
- `400` — sesi closed.
- `404` — warga tidak ditemukan.
- `400` — warga dan sesi berbeda Posyandu.
- `400` — warga sudah terdaftar pada sesi.
- `409` — unique constraint kunjungan.

## GET /kunjungan/antrean-hari-ini

### Query

- `sesi_posyandu_id`
- `search`

Tanpa `sesi_posyandu_id`, controller memakai tanggal database saat ini.

### Success 200

```json
{
  "success": true,
  "message": "Daftar antrean aktif berhasil dimuat.",
  "data": []
}
```

Kunjungan dengan pemeriksaan lengkap Step 2 + Step 4 + Step 5 tidak dimasukkan ke antrean aktif.

## GET /kunjungan

### Query

- `page`
- `limit`
- `search`
- `sesi_posyandu_id`
- `status_langkah`
- `start_date`
- `end_date`

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil data riwayat kunjungan.",
  "data": [],
  "pagination": {
    "total_items": 0,
    "total_pages": 0,
    "current_page": 1,
    "items_per_page": 10
  }
}
```

## GET /kunjungan/:id

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil detail kunjungan.",
  "data": {}
}
```

### Error

`404` — `Data kunjungan tidak ditemukan.`

## PATCH /kunjungan/:id/status-langkah

### Body

```json
{
  "status_langkah": "langkah_2"
}
```

Nilai:

```text
langkah_1
langkah_2
langkah_3
langkah_4
langkah_5
```

`langkah_5` hanya boleh jika pemeriksaan memiliki Step 2, Step 4, dan Step 5 yang selesai.

### Success 200

```json
{
  "success": true,
  "message": "Status langkah kunjungan diperbarui menjadi [langkah_2].",
  "data": {}
}
```

## DELETE /kunjungan/:id

### Success 200

```json
{
  "success": true,
  "message": "Data kunjungan / pendaftaran berhasil dibatalkan."
}
```

Kader tidak dapat membatalkan kunjungan pada sesi yang sudah closed.

---

# 9. Pemeriksaan

## GET /pemeriksaan

### Query

Mengikuti `validator.pemeriksaan.listFilters`.

Mengembalikan daftar pemeriksaan sesuai filter dan pagination controller.

## GET /pemeriksaan/:id

Mengembalikan detail pemeriksaan.

### Error

`404` — `Data pemeriksaan tidak ditemukan.`

## GET /pemeriksaan/:id/step-3

Mengambil data Step 3/plot dari pemeriksaan yang tersimpan.

## GET /pemeriksaan/:id/screening-history

Mengambil riwayat screening pemeriksaan.

## POST /pemeriksaan

Membuat pemeriksaan awal dari kunjungan.

## POST /pemeriksaan/step-2

Menyimpan hasil pengukuran.

Field pengukuran yang digunakan controller:

```text
bb_kg
tb_cm
lingkar_kepala_cm
lila_cm
lingkar_perut_cm
td_sistole
td_diastole
kadar_gula
```

Controller menghitung dan menyimpan z-score pertumbuhan yang tersedia berdasarkan data pemeriksaan dan reference table.

Berhasil mengisi Step 2 menghasilkan `step2_completed_at`.

## POST /pemeriksaan/step-4

Menyimpan screening sesuai kategori sasaran.

Screening tahunan untuk `dewasa`/`lansia` memiliki gate tahunan. Jika sudah ada pada tahun yang sama:

```text
409 — Skrining tahunan untuk warga ini sudah diisi pada tahun tersebut.
```

Berhasil mengisi Step 4 menghasilkan `step4_completed_at`.

## POST /pemeriksaan/step-5

Menyimpan:

```text
topik_penyuluhan
is_perlu_rujukan
alasan_rujukan
status_kehadiran_rujukan
```

Jika rujukan dipilih tanpa trigger otomatis, `alasan_rujukan` wajib diisi.

Berhasil mengisi Step 5 menghasilkan `step5_completed_at`.

## PUT /pemeriksaan/:id

Memperbarui pemeriksaan.

Pengukuran dapat diperbarui. Perubahan tanggal menghitung ulang usia bulan. `profile_kehamilan_id` harus dimiliki warga pemeriksaan.

### Success 200

```json
{
  "success": true,
  "message": "Data pemeriksaan berhasil diperbarui.",
  "data": {}
}
```

## DELETE /pemeriksaan/:id

### Success 200

```json
{
  "success": true,
  "message": "Data pemeriksaan berhasil dihapus."
}
```

---

# 10. Export Pemeriksaan

## GET /pemeriksaan/export

Route ini memakai authentication umum dan digunakan untuk rekap.

### Query

Mengikuti `validator.pemeriksaan.listFilters`.

Untuk role Dinkes, controller membatasi akses personal/search dan menghasilkan rekap agregat.

### Response

```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

Kelompok rekap:

```text
bumil_nifas_menyusui
bayi_balita_apras
usia_sekolah_remaja
dewasa_lansia
```

---

# 11. Rujukan

## GET /rujukan

### Query

- `page`
- `limit`
- `search`
- `puskesmas_id`
- `kader_id`
- `start_date`
- `end_date`

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil daftar rujukan.",
  "data": [],
  "pagination": {
    "total_items": 0,
    "total_pages": 0,
    "current_page": 1,
    "items_per_page": 10
  }
}
```

## GET /rujukan/:id

### Success 200

```json
{
  "success": true,
  "message": "Berhasil mengambil detail rujukan.",
  "data": {}
}
```

### Error

`404` — `Data rujukan tidak ditemukan atau Anda tidak memiliki hak akses.`

## GET /rujukan/:id/export

Menghasilkan surat rujukan PDF.

### Headers

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename=Rujukan_<id>.pdf
```

Isi PDF:

```text
SURAT RUJUKAN POSYANDU
Nomor Rujukan
Tanggal Rujukan
Warga
NIK
Puskesmas
Kader
Alasan Rujukan
Kehadiran Rujukan
ID Pemeriksaan
Tanggal Pemeriksaan
Kategori Sasaran
```

---

# 12. Screening Config

Kedua endpoint berikut memerlukan JWT dan hanya mengizinkan role `dinkesAdmin` atau `sa`.

## GET /screening-config

Tidak memiliki path parameter, query, atau body.

Success `200` membentuk `data` dari seluruh record konfigurasi. Setiap property memakai nilai `key` database dan berisi satu property `value`, yang nilainya berasal dari kolom JSONB pada record tersebut. Contoh struktur untuk key yang didukung validator:

```json
{
  "success": true,
  "data": {
    "asi_eksklusif_months": { "value": [1, 2, 3, 4, 5, 6] }
  }
}
```

Kegagalan controller: `500`, `{ "success": false, "message": "Gagal mengambil konfigurasi screening" }`.

## PUT /screening-config/:id

Path `id` adalah primary key record `ScreeningConfig` yang akan diperbarui. Body wajib berupa object dengan property yang cocok dengan `key` record tersebut. Property yang divalidasi:

| Body key               | Bentuk nilai       |
| ---------------------- | ------------------ |
| `asi_eksklusif_months` | Array integer 1–12 |
| `mpasi_min_age_months` | Integer minimal 0  |
| `mpasi_max_age_months` | Integer minimal 0  |
| `vitamin_a_months`     | Array integer 1–12 |
| `obat_cacing_months`   | Array integer 1–12 |

Body kosong atau key body tidak cocok dengan record ID: `400`. Config tidak ditemukan: `404`.

Success `200`:

```json
{ "success": true, "message": "Konfigurasi screening berhasil diperbarui" }
```

Kegagalan controller: `500`, `{ "success": false, "message": "Gagal memperbarui konfigurasi screening" }`.

---

# 12. Application Flow

## Registrasi Kader

```text
POST /auth/register
        ↓
POST /auth/verify-otp
        ↓
Admin approval
        ↓
POST /auth/login
```

## Sesi Posyandu

```text
POST /sesi-posyandu
        ↓
open
        ↓
POST /kunjungan
        ↓
Step 1
```

## Pemeriksaan

```text
POST /kunjungan
        ↓
POST /pemeriksaan
        ↓
POST /pemeriksaan/step-2
        ↓
GET /pemeriksaan/:id/step-3
        ↓
POST /pemeriksaan/step-4
        ↓
POST /pemeriksaan/step-5
        ↓
Pemeriksaan selesai
```

Completion pemeriksaan:

```text
step2_completed_at
AND
step4_completed_at
AND
step5_completed_at
```

## Mutasi Warga

```text
POST /warga/mutasi/verify
        ↓
PATCH /warga/mutasi/confirm
```

## Rujukan

Rujukan dapat terbentuk dari trigger hasil screening/plot atau pilihan manual dengan alasan rujukan.

Trigger otomatis yang digunakan helper:

```text
is_tbc_terindikasi
is_rujukan_jiwa
is_rujukan_aks
hasil plot dengan is_merah
```

---

# 13. Endpoint Summary

| Method | Endpoint                             | Auth            |
| ------ | ------------------------------------ | --------------- |
| POST   | `/auth/register`                     | Public          |
| POST   | `/auth/verify-otp`                   | Public          |
| POST   | `/auth/resend-otp`                   | Public          |
| POST   | `/auth/login`                        | Public          |
| POST   | `/auth/request-reset-password`       | Public          |
| POST   | `/auth/reset-password`               | Public          |
| POST   | `/auth/logout`                       | JWT             |
| GET    | `/posyandu`                          | Authenticated   |
| GET    | `/posyandu/:id`                      | Authenticated   |
| GET    | `/warga`                             | Personal        |
| GET    | `/warga/export`                      | Personal        |
| GET    | `/warga/statistik-sasaran`           | Authenticated   |
| GET    | `/warga/:id`                         | Personal        |
| POST   | `/warga`                             | Personal        |
| PUT    | `/warga/:id`                         | Personal        |
| PATCH  | `/warga/:id/status-domisili`         | Personal        |
| POST   | `/warga/mutasi/verify`               | Personal        |
| PATCH  | `/warga/mutasi/confirm`              | Personal        |
| GET    | `/imunisasi/warga/:warga_id`         | Personal        |
| GET    | `/imunisasi/:id`                     | Personal        |
| POST   | `/imunisasi`                         | Personal        |
| PUT    | `/imunisasi/:id`                     | Personal        |
| GET    | `/sesi-posyandu`                     | Authenticated   |
| GET    | `/sesi-posyandu/:id`                 | Authenticated   |
| POST   | `/sesi-posyandu`                     | Authenticated   |
| PUT    | `/sesi-posyandu/:id`                 | Authenticated   |
| PATCH  | `/sesi-posyandu/:id/status`          | Authenticated   |
| PATCH  | `/users/:id/verify`                  | Admin           |
| PATCH  | `/users/:id/deactivate`              | Admin           |
| PUT    | `/users/:id/puskesmas-admin`         | Dinkes Admin/SA |
| PUT    | `/users/:id/dinkes-admin`            | Dinkes Admin/SA |
| GET    | `/users/me`                          | JWT             |
| PATCH  | `/users/me`                          | JWT             |
| POST   | `/users/me/profile-picture`          | JWT             |
| GET    | `/users`                             | Admin           |
| GET    | `/users/:id`                         | Admin           |
| PATCH  | `/users/:id/role`                    | SA              |
| PATCH  | `/users/:id/status`                  | Admin           |
| GET    | `/kehamilan/warga/:warga_id`         | Personal        |
| GET    | `/kehamilan/:id`                     | Personal        |
| POST   | `/kehamilan`                         | Personal        |
| PUT    | `/kehamilan/:id`                     | Personal        |
| PATCH  | `/kehamilan/:id/status`              | Personal        |
| POST   | `/kunjungan`                         | Personal        |
| GET    | `/kunjungan/antrean-hari-ini`        | Personal        |
| GET    | `/kunjungan`                         | Personal        |
| GET    | `/kunjungan/:id`                     | Personal        |
| PATCH  | `/kunjungan/:id/status-langkah`      | Personal        |
| DELETE | `/kunjungan/:id`                     | Personal        |
| GET    | `/pemeriksaan`                       | Personal        |
| GET    | `/pemeriksaan/export`                | Authenticated   |
| GET    | `/pemeriksaan/:id/step-3`            | Personal        |
| GET    | `/pemeriksaan/:id/screening-history` | Personal        |
| GET    | `/pemeriksaan/:id`                   | Personal        |
| POST   | `/pemeriksaan`                       | Personal        |
| POST   | `/pemeriksaan/step-2`                | Personal        |
| POST   | `/pemeriksaan/step-4`                | Personal        |
| POST   | `/pemeriksaan/step-5`                | Personal        |
| PUT    | `/pemeriksaan/:id`                   | Personal        |
| DELETE | `/pemeriksaan/:id`                   | Personal        |
| GET    | `/rujukan`                           | Personal        |
| GET    | `/rujukan/:id/export`                | Personal        |
| GET    | `/rujukan/:id`                       | Personal        |
| GET    | `/screening-config`                  | Dinkes Admin/SA |
| PUT    | `/screening-config/:id`              | Dinkes Admin/SA |

**Total: 65 endpoint** pada `/api`. Health check `GET /health` berada di luar router API.
