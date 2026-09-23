# Database Documentation --- POSYANDU

> Dokumentasi ini mencakup **15 migration** dan **13 model domain**
> (`models/index.js` tidak dihitung sebagai model/tabel).

------------------------------------------------------------------------

## 1. Ringkasan

Database POSYANDU menggunakan **PostgreSQL + Sequelize**.

### Jumlah migration

Terdapat **15 migration** yang dijalankan secara berurutan berdasarkan
timestamp.

### Tabel yang dibentuk

Migration membentuk **12 tabel**:

1.  `kecamatan`
2.  `kelurahan`
3.  `puskesmas`
4.  `posyandu`
5.  `warga`
6.  `users`
7.  `profile_kehamilan`
8.  `sesi_posyandu`
9.  `kunjungan_posyandu`
10. `pemeriksaan`
11. `audit_log`
12. `email_otp`
13. `imunisasi`
14. `rujukan`

**Catatan:** berdasarkan daftar migration, jumlah tabel sebenarnya
adalah **14 tabel**, karena `imunisasi` dan `rujukan` dibuat oleh
migration terpisah. Jadi angka 12 hanya berlaku untuk tabel yang
dibentuk pada migration `create-all-tables`; total schema akhir adalah
**14 tabel**.

------------------------------------------------------------------------

# 2. Daftar Migration
| No. | Timestamp        | File                                                   | Fungsi Utama                                                                            |
| --: | ---------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
|   1 | `20260908000000` | `create-table-kecamatan-kelurahan.js`                  | Membuat `kecamatan`, `kelurahan`, dan index wilayah                                     |
|   2 | `20260908015019` | `create-all-tables.js`                                 | Membuat tabel inti POSYANDU                                                             |
|   3 | `20260908041215` | `add-user-token-version.js`                            | Menambah `users.token_version`                                                          |
|   4 | `20260910042705` | `add-pemeriksaan-created-at.js`                        | Menambah `pemeriksaan.created_at`                                                       |
|   5 | `20260910050000` | `align-visit-columns.js`                               | Mengubah `nomor_antrean` menjadi `VARCHAR(10)` dan menambah `created_at` pada kunjungan |
|   6 | `20260914000000` | `update-user-roles.js`                                 | Menambah role `puskesmasAdmin` dan `dinkesAdmin`                                        |
|   7 | `20260914010000` | `add-is-menyusui-to-profile-kehamilan.js`              | Menambah `profile_kehamilan.is_menyusui`                                                |
|   8 | `20260914020000` | `add-location-and-rw-to-sesi-posyandu.js`              | Menambah `lokasi` dan `rw` pada sesi Posyandu                                           |
|   9 | `20260916000000` | `create-imunisasi.js`                                  | Membuat tabel `imunisasi`                                                               |
|  10 | `20260916010000` | `create-rujukan.js`                                    | Membuat tabel `rujukan`                                                                 |
|  11 | `20260921000000` | `add-growth-zscores-and-referral-attendance.js`        | Menambah kolom z-score pemeriksaan dan status kehadiran rujukan                         |
|  12 | `20260921001000` | `add-screening-history.js`                             | Menambah `pemeriksaan.screening_history`                                                |
|  13 | `20260921002000` | `add-email-verification-and-examination-completion.js` | Menambah email verification dan timestamp completion pemeriksaan                        |
|  14 | `20260921003000` | `enforce-one-active-pregnancy.js`                      | Membuat unique partial index untuk satu kehamilan aktif                                 |
|  15 | `20260921004000` | `backfill-active-email-verification.js`                | Backfill email verification untuk user aktif                                            |


# 3. Detail Migration

## 3.1 `20260908000000-create-table-kecamatan-kelurahan.js`

Membuat:

### `kecamatan`

 | Kolom            | Tipe         | Null     | Keterangan         |
| ---------------- | ------------ | -------- | ------------------ |
| `id`             | INTEGER      | NOT NULL | PK, auto increment |
| `nama_kecamatan` | VARCHAR(100) | NOT NULL | Nama kecamatan     |


### `kelurahan`

 | Kolom            | Tipe         | Null     | Keterangan          |
| ---------------- | ------------ | -------- | ------------------- |
| `id`             | INTEGER      | NOT NULL | PK, auto increment  |
| `kecamatan_id`   | INTEGER      | NOT NULL | FK → `kecamatan.id` |
| `nama_kelurahan` | VARCHAR(100) | NOT NULL | Nama kelurahan      |

**Foreign Key**

* `kelurahan.kecamatan_id` → `kecamatan.id`
* `ON UPDATE CASCADE`
* `ON DELETE RESTRICT`

**Index**

* `idx_kelurahan_kecamatan` pada `kelurahan(kecamatan_id)`

**Rollback**

* Drop tabel `kelurahan`
* Drop tabel `kecamatan`


------------------------------------------------------------------------

## 3.2 `20260908015019-create-all-tables.js`

Membuat:

### `puskesmas`

| Kolom            | Tipe         | Null     | Keterangan          |
| ---------------- | ------------ | -------- | ------------------- |
| `id`             | INTEGER      | NOT NULL | PK, auto increment  |
| `kode_puskesmas` | VARCHAR(20)  | NOT NULL | UNIQUE              |
| `nama_puskesmas` | VARCHAR(100) | NOT NULL | Nama Puskesmas      |
| `kelurahan_id`   | INTEGER      | NOT NULL | FK → `kelurahan.id` |
| `alamat`         | TEXT         | NULL     | Alamat              |

**Foreign Key**

* `puskesmas.kelurahan_id` → `kelurahan.id`
* `ON UPDATE CASCADE`
* `ON DELETE RESTRICT`

---

### `posyandu`

| Kolom           | Tipe         | Null     | Keterangan          |
| --------------- | ------------ | -------- | ------------------- |
| `id`            | INTEGER      | NOT NULL | PK, auto increment  |
| `puskesmas_id`  | INTEGER      | NOT NULL | FK → `puskesmas.id` |
| `kelurahan_id`  | INTEGER      | NOT NULL | FK → `kelurahan.id` |
| `nama_posyandu` | VARCHAR(100) | NOT NULL | Nama Posyandu       |
| `alamat`        | TEXT         | NULL     | Alamat              |

**Foreign Key**

* `posyandu.puskesmas_id` → `puskesmas.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE RESTRICT`
* `posyandu.kelurahan_id` → `kelurahan.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE RESTRICT`

---

### `warga`

| Kolom               | Tipe           | Null     | Default / Constraint        |
| ------------------- | -------------- | -------- | --------------------------- |
| `id`                | BIGINT         | NOT NULL | PK, auto increment          |
| `posyandu_id`       | INTEGER        | NOT NULL | FK → `posyandu.id`          |
| `nik`               | VARCHAR(16)    | NULL     | UNIQUE                      |
| `nama_lengkap`      | VARCHAR(100)   | NOT NULL | —                           |
| `jenis_kelamin`     | CHAR(1)        | NULL     | `L` / `P`                   |
| `tanggal_lahir`     | DATE           | NOT NULL | —                           |
| `alamat`            | TEXT           | NULL     | —                           |
| `rt`                | VARCHAR(5)     | NULL     | —                           |
| `rw`                | VARCHAR(5)     | NULL     | —                           |
| `telepon`           | VARCHAR(20)    | NULL     | —                           |
| `nama_ibu`          | VARCHAR(100)   | NULL     | —                           |
| `nama_ayah`         | VARCHAR(100)   | NULL     | —                           |
| `status_perkawinan` | VARCHAR(20)    | NULL     | `menikah` / `tidak_menikah` |
| `pekerjaan`         | VARCHAR(50)    | NULL     | —                           |
| `pekerjaan_lainnya` | VARCHAR(100)   | NULL     | —                           |
| `bb_lahir_kg`       | DECIMAL(4,2)   | NULL     | —                           |
| `tb_lahir_cm`       | DECIMAL(4,2)   | NULL     | —                           |
| `status_domisili`   | VARCHAR(20)    | NULL     | Default `aktif`             |
| `created_at`        | TIMESTAMP/DATE | NULL     | `CURRENT_TIMESTAMP`         |

**Foreign Key**

* `warga.posyandu_id` → `posyandu.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE RESTRICT`

**Check Constraint**

* `chk_warga_jenis_kelamin`: `L`, `P`
* `chk_warga_status_perkawinan`: `menikah`, `tidak_menikah`
* `chk_warga_status_domisili`: `aktif`, `pindah`, `meninggal`

**Index**

* `idx_warga_posyandu_domisili` pada `(posyandu_id, status_domisili)`
* `idx_warga_mutasi_3faktor` pada `(nik, tanggal_lahir, LOWER(nama_ibu))`

---

### `users`

| Kolom             | Tipe           | Null     | Default / Constraint           |
| ----------------- | -------------- | -------- | ------------------------------ |
| `id`              | INTEGER        | NOT NULL | PK, auto increment             |
| `role`            | VARCHAR(20)    | NULL     | Diperbarui migration #6        |
| `email`           | VARCHAR(100)   | NOT NULL | UNIQUE                         |
| `password_hash`   | VARCHAR(255)   | NOT NULL | —                              |
| `nama_lengkap`    | VARCHAR(100)   | NOT NULL | —                              |
| `telepon`         | VARCHAR(20)    | NULL     | —                              |
| `status`          | VARCHAR(20)    | NULL     | `pending_approval`             |
| `puskesmas_id`    | INTEGER        | NULL     | FK → `puskesmas.id`            |
| `posyandu_id`     | INTEGER        | NULL     | FK → `posyandu.id`             |
| `verified_by`     | INTEGER        | NULL     | FK self-reference → `users.id` |
| `verified_at`     | DATE/TIMESTAMP | NULL     | —                              |
| `nik`             | VARCHAR(16)    | NULL     | —                              |
| `profile_picture` | VARCHAR(255)   | NULL     | Default `NULL`                 |

**Foreign Key**

* `users.puskesmas_id` → `puskesmas.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE SET NULL`
* `users.posyandu_id` → `posyandu.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE SET NULL`
* `users.verified_by` → `users.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE SET NULL`

**Check Constraint — Role Awal**

* `kader`
* `puskesmas`
* `dinkes`
* `sa`

**Check Constraint — Status**

* `pending_approval`
* `rejected`
* `active`
* `inactive`

**Migration #6 — Role Terbaru**

Daftar role diperbarui menjadi:

* `kader`
* `puskesmas`
* `puskesmasAdmin`
* `dinkes`
* `dinkesAdmin`
* `sa`

### `profile_kehamilan`

| Kolom                      | Tipe         | Null     | Default / Constraint |
| -------------------------- | ------------ | -------- | -------------------- |
| `id`                       | BIGINT       | NOT NULL | PK, auto increment   |
| `warga_id`                 | BIGINT       | NOT NULL | FK → `warga.id`      |
| `nama_suami`               | VARCHAR(100) | NULL     | —                    |
| `hpht`                     | DATE         | NULL     | —                    |
| `hpl`                      | DATE         | NULL     | —                    |
| `anak_ke`                  | INTEGER      | NULL     | —                    |
| `jarak_anak_sebelum_bulan` | INTEGER      | NULL     | —                    |
| `tanggal_persalinan`       | DATE         | NULL     | —                    |
| `cara_persalinan`          | VARCHAR(30)  | NULL     | —                    |
| `status_kehamilan`         | VARCHAR(20)  | NULL     | —                    |
| `is_menyusui`              | BOOLEAN      | NOT NULL | Default `false`      |

**Foreign Key**

* `profile_kehamilan.warga_id` → `warga.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE CASCADE`

**Check Constraint**

* `cara_persalinan`: `normal`, `dengan_tindakan`
* `status_kehamilan`: `hamil`, `nifas`, `menyusui`, `selesai`

**Migration #7**

* Menambah `is_menyusui BOOLEAN NOT NULL DEFAULT false`

**Migration #14**

Menambahkan unique partial index:

* `uq_profile_kehamilan_active_hamil` pada `warga_id`
* Hanya berlaku ketika `status_kehamilan = 'hamil'`

Artinya, pada level database, satu warga hanya dapat memiliki **satu profile dengan status `hamil` aktif**.

---

### `sesi_posyandu`

| Kolom                 | Tipe         | Null     | Default / Constraint          |
| --------------------- | ------------ | -------- | ----------------------------- |
| `id`                  | BIGINT       | NOT NULL | PK, auto increment            |
| `posyandu_id`         | INTEGER      | NOT NULL | FK → `posyandu.id`            |
| `tanggal_pelaksanaan` | DATE         | NOT NULL | —                             |
| `status`              | VARCHAR(10)  | NULL     | Default `open`                |
| `lokasi`              | VARCHAR(255) | NOT NULL | Ditambahkan pada Migration #8 |
| `rw`                  | VARCHAR(5)   | NOT NULL | Ditambahkan pada Migration #8 |

**Foreign Key**

* `sesi_posyandu.posyandu_id` → `posyandu.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE RESTRICT`

**Check Constraint**

* `status`: `open`, `closed`

**Unique Constraint**

* `uq_sesi_posyandu_tanggal` pada `(posyandu_id, tanggal_pelaksanaan)`

**Index**

* `idx_sesi_posyandu_status` pada `(posyandu_id, status, tanggal_pelaksanaan)`

**Migration #8**

* Menambah `lokasi VARCHAR(255) NOT NULL`
* Menambah `rw VARCHAR(5) NOT NULL`

---

### `kunjungan_posyandu`

| Kolom              | Tipe           | Null     | Default / Constraint                  |
| ------------------ | -------------- | -------- | ------------------------------------- |
| `id`               | BIGINT         | NOT NULL | PK, auto increment                    |
| `sesi_posyandu_id` | BIGINT         | NOT NULL | FK → `sesi_posyandu.id`               |
| `warga_id`         | BIGINT         | NOT NULL | FK → `warga.id`                       |
| `nomor_antrean`    | VARCHAR(10)    | NOT NULL | Diubah dari INTEGER pada Migration #5 |
| `status_langkah`   | VARCHAR(20)    | NULL     | Default `langkah_1`                   |
| `created_at`       | DATE/TIMESTAMP | NOT NULL | Default `CURRENT_TIMESTAMP`           |

**Foreign Key**

* `kunjungan_posyandu.sesi_posyandu_id` → `sesi_posyandu.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE CASCADE`
* `kunjungan_posyandu.warga_id` → `warga.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE RESTRICT`

**Check Constraint**

* `status_langkah`: `langkah_1` sampai `langkah_5`

**Unique Constraint**

* `uq_kunjungan_sesi_warga` pada `(sesi_posyandu_id, warga_id)`
* `uq_kunjungan_sesi_antrean` pada `(sesi_posyandu_id, nomor_antrean)`

**Migration #5**

* Mengubah `nomor_antrean` dari `INTEGER` menjadi `VARCHAR(10)`
* Menambah `created_at DATE/TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`

**Index**

* `idx_kunjungan_antrean` pada `(sesi_posyandu_id, nomor_antrean)`

---

### `pemeriksaan`

| Kolom                  | Tipe           | Null     | Default / Constraint                 |
| ---------------------- | -------------- | -------- | ------------------------------------ |
| `id`                   | BIGINT         | NOT NULL | PK, auto increment                   |
| `kunjungan_id`         | BIGINT         | NOT NULL | UNIQUE, FK → `kunjungan_posyandu.id` |
| `profile_kehamilan_id` | BIGINT         | NULL     | FK → `profile_kehamilan.id`          |
| `tanggal`              | DATE           | NOT NULL | `CURRENT_DATE`                       |
| `usia_bulan`           | INTEGER        | NOT NULL | —                                    |
| `kategori_sasaran`     | VARCHAR(20)    | NULL     | —                                    |
| `bb_kg`                | DECIMAL(5,2)   | NULL     | —                                    |
| `tb_cm`                | DECIMAL(5,2)   | NULL     | —                                    |
| `lingkar_kepala_cm`    | DECIMAL(4,2)   | NULL     | —                                    |
| `lila_cm`              | DECIMAL(4,2)   | NULL     | —                                    |
| `lingkar_perut_cm`     | DECIMAL(5,2)   | NULL     | —                                    |
| `td_sistole`           | INTEGER        | NULL     | —                                    |
| `td_diastole`          | INTEGER        | NULL     | —                                    |
| `kadar_gula`           | INTEGER        | NULL     | —                                    |
| `detail_skrining`      | JSONB          | NULL     | Default `{}`                         |
| `topik_penyuluhan`     | TEXT           | NULL     | —                                    |
| `is_perlu_rujukan`     | BOOLEAN        | NULL     | Default `false`                      |
| `created_at`           | TIMESTAMP/DATE | —        | Ditambahkan pada Migration #4        |
| `zscore_bbu`           | DECIMAL(8,4)   | —        | Ditambahkan pada Migration #11       |
| `zscore_pbu`           | DECIMAL(8,4)   | —        | Ditambahkan pada Migration #11       |
| `zscore_tbu`           | DECIMAL(8,4)   | —        | Ditambahkan pada Migration #11       |
| `zscore_bbpb`          | DECIMAL(8,4)   | —        | Ditambahkan pada Migration #11       |
| `zscore_bbtb`          | DECIMAL(8,4)   | —        | Ditambahkan pada Migration #11       |
| `zscore_imtu`          | DECIMAL(8,4)   | —        | Ditambahkan pada Migration #11       |
| `screening_history`    | JSONB          | NOT NULL | Default `[]`, Migration #12          |
| `step2_completed_at`   | TIMESTAMP/DATE | —        | Ditambahkan pada Migration #13       |
| `step4_completed_at`   | TIMESTAMP/DATE | —        | Ditambahkan pada Migration #13       |
| `step5_completed_at`   | TIMESTAMP/DATE | —        | Ditambahkan pada Migration #13       |

**Foreign Key**

* `pemeriksaan.kunjungan_id` → `kunjungan_posyandu.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE CASCADE`
* `pemeriksaan.profile_kehamilan_id` → `profile_kehamilan.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE SET NULL`

**Unique Constraint**

* `kunjungan_id` bersifat `UNIQUE`, sehingga satu kunjungan memiliki paling banyak satu pemeriksaan.

**Check Constraint — Kategori**

* `bumil`
* `busui`
* `bayi`
* `balita`
* `apras`
* `uskrem_6_14`
* `uskrem_15_18`
* `dewasa`
* `lansia`

**Check Constraint — Nilai**

* `bb_kg IS NULL OR bb_kg > 0`
* `tb_cm IS NULL OR tb_cm > 0`
* `td_sistole IS NULL OR td_sistole > 0`
* `td_diastole IS NULL OR td_diastole > 0`

**Migration #4**

* Menambah `created_at`

**Migration #11**

Menambahkan kolom z-score:

* `zscore_bbu DECIMAL(8,4)`
* `zscore_pbu DECIMAL(8,4)`
* `zscore_tbu DECIMAL(8,4)`
* `zscore_bbpb DECIMAL(8,4)`
* `zscore_bbtb DECIMAL(8,4)`
* `zscore_imtu DECIMAL(8,4)`

**Migration #12**

* Menambah `screening_history JSONB NOT NULL DEFAULT []`

**Migration #13**

* Menambah `step2_completed_at`
* Menambah `step4_completed_at`
* Menambah `step5_completed_at`

**Index**

* `idx_pemeriksaan_kategori_tanggal` pada `(kategori_sasaran, tanggal)`
* `idx_pemeriksaan_detail_skrining_gin` menggunakan PostgreSQL GIN pada `detail_skrining`

### `audit_log`

| Kolom        | Tipe           | Null     | Keterangan         |
| ------------ | -------------- | -------- | ------------------ |
| `id`         | BIGINT         | NOT NULL | PK, auto increment |
| `user_id`    | INTEGER        | NULL     | FK → `users.id`    |
| `action`     | VARCHAR(50)    | NOT NULL | —                  |
| `table_name` | VARCHAR(50)    | NOT NULL | —                  |
| `record_id`  | BIGINT         | NULL     | —                  |
| `old_value`  | JSONB          | NULL     | —                  |
| `new_value`  | JSONB          | NULL     | —                  |
| `created_at` | DATE/TIMESTAMP | NULL     | —                  |

**Foreign Key**

* `audit_log.user_id` → `users.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE SET NULL`

**Index**

* `idx_audit_log_record` pada `(table_name, record_id)`

---

### `email_otp`

| Kolom        | Tipe           | Null     | Default / Constraint |
| ------------ | -------------- | -------- | -------------------- |
| `id`         | BIGINT         | NOT NULL | PK, auto increment   |
| `email`      | VARCHAR(100)   | NOT NULL | —                    |
| `otp_code`   | VARCHAR(10)    | NOT NULL | —                    |
| `purpose`    | VARCHAR(30)    | NULL     | —                    |
| `is_used`    | BOOLEAN        | NULL     | Default `false`      |
| `attempts`   | INTEGER        | NULL     | Default `0`          |
| `expires_at` | DATE/TIMESTAMP | NOT NULL | —                    |

**Check Constraint**

* `purpose`: `register`, `reset_password`

**Index**

* `idx_email_otp_lookup` pada `(email, purpose, is_used, expires_at)`

---

## 3.3 `20260908041215-add-user-token-version.js`

Menambah kolom pada `users`:

| Kolom           | Tipe    | Null     | Default |
| --------------- | ------- | -------- | ------- |
| `token_version` | INTEGER | NOT NULL | `1`     |

**Rollback**

* Menghapus kolom `token_version`

---

## 3.4 `20260910042705-add-pemeriksaan-created-at.js`

Menambah kolom pada `pemeriksaan`:

| Kolom        | Tipe           | Null | Default             |
| ------------ | -------------- | ---- | ------------------- |
| `created_at` | DATE/TIMESTAMP | —    | `CURRENT_TIMESTAMP` |

**Rollback**

* Menghapus kolom `created_at`

---

## 3.5 `20260910050000-align-visit-columns.js`

Perubahan pada `kunjungan_posyandu`:

| Kolom           | Perubahan                                                    |
| --------------- | ------------------------------------------------------------ |
| `nomor_antrean` | `INTEGER` → `VARCHAR(10)`                                    |
| `created_at`    | Menambah `DATE/TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP` |

**Rollback**

* Menghapus `created_at`
* Mengembalikan `nomor_antrean` menjadi `INTEGER` menggunakan normalisasi karakter non-digit

---

## 3.6 `20260914000000-update-user-roles.js`

Constraint `chk_users_role` diperbarui.

**Role yang diperbolehkan**

* `kader`
* `puskesmas`
* `puskesmasAdmin`
* `dinkes`
* `dinkesAdmin`
* `sa`

**Rollback**

Mengembalikan daftar role awal:

* `kader`
* `puskesmas`
* `dinkes`
* `sa`

---

## 3.7 `20260914010000-add-is-menyusui-to-profile-kehamilan.js`

Menambah kolom pada `profile_kehamilan`:

| Kolom         | Tipe    | Null     | Default |
| ------------- | ------- | -------- | ------- |
| `is_menyusui` | BOOLEAN | NOT NULL | `false` |

**Rollback**

* Menghapus kolom `is_menyusui`

---

## 3.8 `20260914020000-add-location-and-rw-to-sesi-posyandu.js`

Menambah kolom pada `sesi_posyandu`:

| Kolom    | Tipe         | Null     |
| -------- | ------------ | -------- |
| `lokasi` | VARCHAR(255) | NOT NULL |
| `rw`     | VARCHAR(5)   | NOT NULL |

Migration terlebih dahulu membuat kedua kolom dengan default `""`, kemudian mengubahnya menjadi `NOT NULL` tanpa default.

**Rollback**

* Menghapus `rw`
* Menghapus `lokasi`

---

## 3.9 `20260916000000-create-imunisasi.js`

Membuat tabel `imunisasi`.

| Kolom               | Tipe         | Null     | Keterangan         |
| ------------------- | ------------ | -------- | ------------------ |
| `id`                | BIGINT       | NOT NULL | PK, auto increment |
| `warga_id`          | BIGINT       | NOT NULL | FK → `warga.id`    |
| `jenis_imunisasi`   | VARCHAR(100) | NOT NULL | —                  |
| `tanggal_imunisasi` | DATE         | NOT NULL | —                  |

**Foreign Key**

* `imunisasi.warga_id` → `warga.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE CASCADE`

**Index**

* `idx_imunisasi_warga_tanggal` pada `(warga_id, tanggal_imunisasi)`

---

## 3.10 `20260916010000-create-rujukan.js`

Membuat tabel `rujukan`.

| Kolom                      | Tipe           | Null     | Default / Constraint           |
| -------------------------- | -------------- | -------- | ------------------------------ |
| `id`                       | BIGINT         | NOT NULL | PK, auto increment             |
| `warga_id`                 | BIGINT         | NOT NULL | FK → `warga.id`                |
| `pemeriksaan_id`           | BIGINT         | NOT NULL | UNIQUE, FK → `pemeriksaan.id`  |
| `puskesmas_id`             | INTEGER        | NOT NULL | FK → `puskesmas.id`            |
| `kader_id`                 | INTEGER        | NOT NULL | FK → `users.id`                |
| `tanggal_rujukan`          | DATE           | NOT NULL | —                              |
| `alasan_rujukan`           | TEXT           | NOT NULL | —                              |
| `created_at`               | DATE/TIMESTAMP | NOT NULL | `CURRENT_TIMESTAMP`            |
| `updated_at`               | DATE/TIMESTAMP | NOT NULL | `CURRENT_TIMESTAMP`            |
| `status_kehadiran_rujukan` | VARCHAR(20)    | NULL     | Ditambahkan pada Migration #11 |

**Foreign Key**

* `rujukan.warga_id` → `warga.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE RESTRICT`
* `rujukan.pemeriksaan_id` → `pemeriksaan.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE CASCADE`
* `rujukan.puskesmas_id` → `puskesmas.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE RESTRICT`
* `rujukan.kader_id` → `users.id`

  * `ON UPDATE CASCADE`
  * `ON DELETE RESTRICT`

**Index**

* `idx_rujukan_warga_id` pada `warga_id`
* `idx_rujukan_puskesmas_tanggal` pada `(puskesmas_id, tanggal_rujukan)`

**Check Constraint**

* `status_kehadiran_rujukan`: `hadir`, `tidak_hadir`

---

## 3.11 `20260921000000-add-growth-zscores-and-referral-attendance.js`

Menambahkan enam kolom z-score pada `pemeriksaan`:

| Kolom         | Tipe         |
| ------------- | ------------ |
| `zscore_bbu`  | DECIMAL(8,4) |
| `zscore_pbu`  | DECIMAL(8,4) |
| `zscore_tbu`  | DECIMAL(8,4) |
| `zscore_bbpb` | DECIMAL(8,4) |
| `zscore_bbtb` | DECIMAL(8,4) |
| `zscore_imtu` | DECIMAL(8,4) |

Menambahkan pada `rujukan`:

| Kolom                      | Tipe        | Null |
| -------------------------- | ----------- | ---- |
| `status_kehadiran_rujukan` | VARCHAR(20) | NULL |

**Check Constraint**

* `hadir`
* `tidak_hadir`


## 3.12 `20260921001000-add-screening-history.js`

Menambah kolom pada `pemeriksaan`:

| Kolom               | Tipe  | Null     | Default |
| ------------------- | ----- | -------- | ------- |
| `screening_history` | JSONB | NOT NULL | `[]`    |

**Rollback**

* Menghapus kolom `screening_history`

---

## 3.13 `20260921002000-add-email-verification-and-examination-completion.js`

Menambah kolom pada `users`:

| Kolom               | Tipe           | Null     | Default |
| ------------------- | -------------- | -------- | ------- |
| `email_verified`    | BOOLEAN        | NOT NULL | `false` |
| `email_verified_at` | DATE/TIMESTAMP | NULL     | —       |

**Backfill `users`**

Untuk user dengan:

```text
status = 'active'
```

dilakukan pembaruan menjadi:

```text
email_verified = true
email_verified_at = CURRENT_TIMESTAMP
```

Menambah kolom pada `pemeriksaan`:

| Kolom                | Tipe           | Null |
| -------------------- | -------------- | ---- |
| `step2_completed_at` | DATE/TIMESTAMP | NULL |
| `step4_completed_at` | DATE/TIMESTAMP | NULL |
| `step5_completed_at` | DATE/TIMESTAMP | NULL |

---

## 3.14 `20260921003000-enforce-one-active-pregnancy.js`

Membuat **unique partial index PostgreSQL**:

* `uq_profile_kehamilan_active_hamil`
* Pada `profile_kehamilan(warga_id)`
* Predicate: `status_kehamilan = 'hamil'`

**Tujuan**

Membatasi satu warga agar hanya memiliki **satu profile kehamilan aktif (`hamil`)** pada level database.

**Rollback**

```sql
DROP INDEX IF EXISTS uq_profile_kehamilan_active_hamil;
```

---

## 3.15 `20260921004000-backfill-active-email-verification.js`

Melakukan backfill untuk seluruh user dengan:

```text
status = 'active'
```

Menjadi:

```text
email_verified = true
email_verified_at = CURRENT_TIMESTAMP
```

**Rollback**

* `down()` sengaja dibiarkan kosong karena migration ini hanya melakukan backfill data.


# 4. Daftar Model

Model yang tersedia:

1.  `AuditLog`
2.  `EmailOtp`
3.  `Imunisasi`
4.  `Kecamatan`
5.  `Kelurahan`
6.  `KunjunganPosyandu`
7.  `Pemeriksaan`
8.  `Posyandu`
9.  `ProfileKehamilan`
10. `Puskesmas`
11. `Rujukan`
12. `SesiPosyandu`
13. `User`
14. `Warga`

`models/index.js` merupakan loader/registrasi model dan bukan tabel.

------------------------------------------------------------------------

### 5. Kesesuaian Migration ↔ Model

Berdasarkan seluruh migration dan model yang diberikan:

| Area               | Status | Keterangan                                                                                    |
| ------------------ | ------ | --------------------------------------------------------------------------------------------- |
| Kecamatan          | Match  | Model sesuai dengan schema migration                                                          |
| Kelurahan          | Match  | FK `kecamatan_id` sesuai                                                                      |
| Puskesmas          | Match  | Field sesuai                                                                                  |
| Posyandu           | Match  | Field sesuai                                                                                  |
| Warga              | Match  | Field sesuai dengan migration                                                                 |
| User               | Match  | `token_version`, email verification, dan pembaruan role tercakup dalam migration              |
| Profile Kehamilan  | Match  | `is_menyusui` tercakup dalam Migration #7                                                     |
| Sesi Posyandu      | Match  | `lokasi` dan `rw` tercakup dalam Migration #8                                                 |
| Kunjungan Posyandu | Match  | `nomor_antrean VARCHAR(10)` dan `created_at` tercakup dalam Migration #5                      |
| Pemeriksaan        | Match  | z-score, `screening_history`, completion timestamp, dan `created_at` tercakup dalam migration |
| Audit Log          | Match  | Field sesuai                                                                                  |
| Email OTP          | Match  | Field sesuai                                                                                  |
| Imunisasi          | Match  | Migration #9 tersedia                                                                         |
| Rujukan            | Match  | Migration #10 dan #11 mencakup field model                                                    |

**Kesimpulan**

Berdasarkan source yang diberikan, **seluruh field pada model telah memiliki dukungan migration yang sesuai**. Tidak ditemukan lagi kasus *model memiliki field tetapi migration-nya tidak tersedia* seperti yang sebelumnya ditemukan pada audit parsial.

# 6. Relasi Antar Tabel

## Wilayah

``` text
Kecamatan
   │
   └──< Kelurahan
          │
          ├──< Puskesmas
          │       │
          │       └──< Posyandu
          │
          └──< Posyandu
```

Relasi yang direpresentasikan model:

``` text
Kecamatan 1 ─── N Kelurahan
Kelurahan 1 ─── N Puskesmas
Kelurahan 1 ─── N Posyandu
Puskesmas 1 ─── N Posyandu
```

------------------------------------------------------------------------

## Data Warga

``` text
Posyandu
   │
   └──< Warga
          ├──< ProfileKehamilan
          ├──< KunjunganPosyandu
          ├──< Imunisasi
          └──< Rujukan
```

------------------------------------------------------------------------

## Pemeriksaan

``` text
SesiPosyandu
   │
   └──< KunjunganPosyandu
           │
           └── 1 Pemeriksaan
                    │
                    ├── ProfileKehamilan
                    └── 1 Rujukan
```

------------------------------------------------------------------------

## User

``` text
Puskesmas ───< User
Posyandu  ───< User

User ─── User
       (verified_by)

User ───< AuditLog
User ───< Rujukan
```

------------------------------------------------------------------------

# 7. ERD

``` mermaid
erDiagram
    KECAMATAN ||--o{ KELURAHAN : memiliki
    KELURAHAN ||--o{ PUSKESMAS : memiliki
    KELURAHAN ||--o{ POSYANDU : memiliki
    PUSKESMAS ||--o{ POSYANDU : menaungi
    POSYANDU ||--o{ WARGA : memiliki
    POSYANDU ||--o{ USER : memiliki
    POSYANDU ||--o{ SESI_POSYANDU : mengadakan
    WARGA ||--o{ PROFILE_KEHAMILAN : memiliki
    WARGA ||--o{ KUNJUNGAN_POSYANDU : melakukan
    WARGA ||--o{ IMUNISASI : menerima
    WARGA ||--o{ RUJUKAN : menerima
    SESI_POSYANDU ||--o{ KUNJUNGAN_POSYANDU : berisi
    KUNJUNGAN_POSYANDU ||--o| PEMERIKSAAN : memiliki
    PROFILE_KEHAMILAN ||--o{ PEMERIKSAAN : terkait
    PEMERIKSAAN ||--o| RUJUKAN : menghasilkan
    PUSKESMAS ||--o{ USER : memiliki
    PUSKESMAS ||--o{ RUJUKAN : menerima
    USER ||--o{ AUDIT_LOG : menghasilkan
    USER ||--o{ RUJUKAN : membuat
    USER ||--o{ USER : memverifikasi

    KECAMATAN {
        int id PK
        string nama_kecamatan
    }

    KELURAHAN {
        int id PK
        int kecamatan_id FK
        string nama_kelurahan
    }

    PUSKESMAS {
        int id PK
        string kode_puskesmas UK
        string nama_puskesmas
        int kelurahan_id FK
        text alamat
    }

    POSYANDU {
        int id PK
        int puskesmas_id FK
        int kelurahan_id FK
        string nama_posyandu
        text alamat
    }

    WARGA {
        bigint id PK
        int posyandu_id FK
        string nik UK
        string nama_lengkap
        date tanggal_lahir
        string status_domisili
    }

    USER {
        int id PK
        string role
        string email UK
        string status
        int puskesmas_id FK
        int posyandu_id FK
    }

    PROFILE_KEHAMILAN {
        bigint id PK
        bigint warga_id FK
        date hpht
        date hpl
        string status_kehamilan
        boolean is_menyusui
    }

    SESI_POSYANDU {
        bigint id PK
        int posyandu_id FK
        date tanggal_pelaksanaan
        string lokasi
        string rw
        string status
    }

    KUNJUNGAN_POSYANDU {
        bigint id PK
        bigint sesi_posyandu_id FK
        bigint warga_id FK
        string nomor_antrean
        string status_langkah
        datetime created_at
    }

    PEMERIKSAAN {
        bigint id PK
        bigint kunjungan_id FK
        bigint profile_kehamilan_id FK
        date tanggal
        int usia_bulan
        string kategori_sasaran
        decimal zscore_bbu
        decimal zscore_pbu
        decimal zscore_tbu
        decimal zscore_bbpb
        decimal zscore_bbtb
        decimal zscore_imtu
    }

    IMUNISASI {
        bigint id PK
        bigint warga_id FK
        string jenis_imunisasi
        date tanggal_imunisasi
    }

    RUJUKAN {
        bigint id PK
        bigint warga_id FK
        bigint pemeriksaan_id FK
        int puskesmas_id FK
        int kader_id FK
        date tanggal_rujukan
        string status_kehadiran_rujukan
    }

    AUDIT_LOG {
        bigint id PK
        int user_id FK
        string action
        string table_name
        bigint record_id
        jsonb old_value
        jsonb new_value
    }

    EMAIL_OTP {
        bigint id PK
        string email
        string otp_code
        string purpose
        boolean is_used
        int attempts
        datetime expires_at
    }
```

------------------------------------------------------------------------

# 8. Index

| Index                                 | Tabel                | Kolom / Expression                         |
| ------------------------------------- | -------------------- | ------------------------------------------ |
| `idx_kelurahan_kecamatan`             | `kelurahan`          | `kecamatan_id`                             |
| `idx_warga_posyandu_domisili`         | `warga`              | `posyandu_id, status_domisili`             |
| `idx_warga_mutasi_3faktor`            | `warga`              | `nik, tanggal_lahir, LOWER(nama_ibu)`      |
| `idx_sesi_posyandu_status`            | `sesi_posyandu`      | `posyandu_id, status, tanggal_pelaksanaan` |
| `idx_kunjungan_antrean`               | `kunjungan_posyandu` | `sesi_posyandu_id, nomor_antrean`          |
| `idx_pemeriksaan_kategori_tanggal`    | `pemeriksaan`        | `kategori_sasaran, tanggal`                |
| `idx_pemeriksaan_detail_skrining_gin` | `pemeriksaan`        | GIN `detail_skrining`                      |
| `idx_profile_kehamilan_warga_status`  | `profile_kehamilan`  | `warga_id, status_kehamilan`               |
| `idx_audit_log_record`                | `audit_log`          | `table_name, record_id`                    |
| `idx_email_otp_lookup`                | `email_otp`          | `email, purpose, is_used, expires_at`      |
| `idx_imunisasi_warga_tanggal`         | `imunisasi`          | `warga_id, tanggal_imunisasi`              |
| `idx_rujukan_warga_id`                | `rujukan`            | `warga_id`                                 |
| `idx_rujukan_puskesmas_tanggal`       | `rujukan`            | `puskesmas_id, tanggal_rujukan`            |
| `uq_profile_kehamilan_active_hamil`   | `profile_kehamilan`  | Unique `warga_id` WHERE `status = 'hamil'` |

---

# 9. Unique Constraints

| Constraint                          | Tabel                | Kolom                                              |
| ----------------------------------- | -------------------- | -------------------------------------------------- |
| `UNIQUE`                            | `puskesmas`          | `kode_puskesmas`                                   |
| `UNIQUE`                            | `warga`              | `nik`                                              |
| `UNIQUE`                            | `users`              | `email`                                            |
| `uq_sesi_posyandu_tanggal`          | `sesi_posyandu`      | `posyandu_id, tanggal_pelaksanaan`                 |
| `uq_kunjungan_sesi_warga`           | `kunjungan_posyandu` | `sesi_posyandu_id, warga_id`                       |
| `uq_kunjungan_sesi_antrean`         | `kunjungan_posyandu` | `sesi_posyandu_id, nomor_antrean`                  |
| `UNIQUE`                            | `pemeriksaan`        | `kunjungan_id`                                     |
| `UNIQUE`                            | `rujukan`            | `pemeriksaan_id`                                   |
| `uq_profile_kehamilan_active_hamil` | `profile_kehamilan`  | Partial unique `warga_id` untuk `status = 'hamil'` |

------------------------------------------------------------------------
## 10. Check Constraints

### `Warga`

| Constraint                    | Nilai yang Diperbolehkan       |
| ----------------------------- | ------------------------------ |
| `chk_warga_jenis_kelamin`     | `L`, `P`                       |
| `chk_warga_status_perkawinan` | `menikah`, `tidak_menikah`     |
| `chk_warga_status_domisili`   | `aktif`, `pindah`, `meninggal` |

### `Users`

| Constraint         | Nilai yang Diperbolehkan                                              |
| ------------------ | --------------------------------------------------------------------- |
| `chk_users_role`   | `kader`, `puskesmas`, `puskesmasAdmin`, `dinkes`, `dinkesAdmin`, `sa` |
| `chk_users_status` | `pending_approval`, `rejected`, `active`, `inactive`                  |

### `Profile Kehamilan`

| Constraint                      | Nilai yang Diperbolehkan                |
| ------------------------------- | --------------------------------------- |
| `chk_kehamilan_cara_persalinan` | `normal`, `dengan_tindakan`             |
| `chk_kehamilan_status`          | `hamil`, `nifas`, `menyusui`, `selesai` |

### `Sesi Posyandu`

| Constraint        | Nilai yang Diperbolehkan |
| ----------------- | ------------------------ |
| `chk_sesi_status` | `open`, `closed`         |

### `Kunjungan`

| Constraint                     | Nilai yang Diperbolehkan                                        |
| ------------------------------ | --------------------------------------------------------------- |
| `chk_kunjungan_status_langkah` | `langkah_1`, `langkah_2`, `langkah_3`, `langkah_4`, `langkah_5` |

### `Pemeriksaan`

| Constraint                 | Nilai yang Diperbolehkan                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `chk_pemeriksaan_kategori` | `bumil`, `busui`, `bayi`, `balita`, `apras`, `uskrem_6_14`, `uskrem_15_18`, `dewasa`, `lansia` |

**Validasi Nilai Numerik**

| Kolom         | Constraint        |
| ------------- | ----------------- |
| `bb_kg`       | `NULL` atau `> 0` |
| `tb_cm`       | `NULL` atau `> 0` |
| `td_sistole`  | `NULL` atau `> 0` |
| `td_diastole` | `NULL` atau `> 0` |

### `Email OTP`

| Constraint        | Nilai yang Diperbolehkan     |
| ----------------- | ---------------------------- |
| `chk_otp_purpose` | `register`, `reset_password` |

### `Rujukan`

| Constraint                     | Nilai yang Diperbolehkan |
| ------------------------------ | ------------------------ |
| `chk_rujukan_status_kehadiran` | `hadir`, `tidak_hadir`   |

---

## 11. Model Associations

### `Kecamatan`

* `hasMany Kelurahan`

### `Kelurahan`

* `belongsTo Kecamatan`
* `hasMany Puskesmas`
* `hasMany Posyandu`

### `Puskesmas`

* `belongsTo Kelurahan`
* `hasMany Posyandu`
* `hasMany User`
* `hasMany Rujukan`

### `Posyandu`

* `belongsTo Puskesmas`
* `belongsTo Kelurahan`
* `hasMany Warga`
* `hasMany User`
* `hasMany SesiPosyandu`

### `Warga`

* `belongsTo Posyandu`
* `hasMany ProfileKehamilan`
* `hasMany KunjunganPosyandu`
* `hasMany Imunisasi`
* `hasMany Rujukan`

### `User`

* `belongsTo Puskesmas`
* `belongsTo Posyandu`
* `belongsTo User` sebagai `verifiedByUser`
* `hasMany User` sebagai `verifiedUsers`
* `hasMany Rujukan`
* `hasMany AuditLog`

### `ProfileKehamilan`

* `belongsTo Warga`
* `hasMany Pemeriksaan`

### `SesiPosyandu`

* `belongsTo Posyandu`
* `hasMany KunjunganPosyandu`

### `KunjunganPosyandu`

* `belongsTo SesiPosyandu`
* `belongsTo Warga`
* `hasOne Pemeriksaan`

### `Pemeriksaan`

* `belongsTo KunjunganPosyandu`
* `belongsTo ProfileKehamilan`
* `hasOne Rujukan`

### `Imunisasi`

* `belongsTo Warga`

### `Rujukan`

* `belongsTo Warga`
* `belongsTo Pemeriksaan`
* `belongsTo Puskesmas`
* `belongsTo User` sebagai `kader`

### `AuditLog`

* `belongsTo User`

## 12. Timestamps

| Model/Tabel          | Timestamps                 |
| -------------------- | -------------------------- |
| `kecamatan`          | Tidak                      |
| `kelurahan`          | Tidak                      |
| `puskesmas`          | Tidak                      |
| `posyandu`           | Tidak                      |
| `warga`              | `created_at` saja          |
| `users`              | Tidak                      |
| `profile_kehamilan`  | Tidak                      |
| `sesi_posyandu`      | Tidak                      |
| `kunjungan_posyandu` | `created_at` saja          |
| `pemeriksaan`        | `created_at` saja          |
| `audit_log`          | `created_at` saja          |
| `email_otp`          | Tidak                      |
| `imunisasi`          | Tidak                      |
| `rujukan`            | `created_at`, `updated_at` |

**Khusus model `Rujukan`:**

```js
timestamps: true,
createdAt: "created_at",
updatedAt: "updated_at"
```

---

## 13. Alur Perubahan Schema

Secara kronologis, evolusi schema adalah:

```text
Wilayah
  ↓
Core Tables
  ↓
JWT Token Version
  ↓
Pemeriksaan Created At
  ↓
Kunjungan Alignment
  ↓
Role Administration
  ↓
Profile Menyusui
  ↓
Lokasi + RW Sesi Posyandu
  ↓
Imunisasi
  ↓
Rujukan
  ↓
Growth Z-Score + Referral Attendance
  ↓
Screening History
  ↓
Email Verification + Examination Completion
  ↓
One Active Pregnancy Constraint
  ↓
Backfill Active Email Verification
```

---

## 14. Rollback Order

Migration Sequelize dijalankan berdasarkan timestamp, sehingga rollback dilakukan dalam urutan terbalik.

### Urutan Migration

| No. | Migration                                     | Deskripsi                                          |
| --: | --------------------------------------------- | -------------------------------------------------- |
| 001 | `create wilayah`                              | Membuat tabel wilayah                              |
| 002 | `create core tables`                          | Membuat tabel inti                                 |
| 003 | `token version`                               | Menambah token version                             |
| 004 | `pemeriksaan created_at`                      | Menambah `created_at` pada pemeriksaan             |
| 005 | `visit alignment`                             | Menyesuaikan kolom kunjungan                       |
| 006 | `user roles`                                  | Memperbarui role user                              |
| 007 | `is_menyusui`                                 | Menambah status menyusui                           |
| 008 | `sesi lokasi + rw`                            | Menambah lokasi dan RW                             |
| 009 | `imunisasi`                                   | Membuat tabel imunisasi                            |
| 010 | `rujukan`                                     | Membuat tabel rujukan                              |
| 011 | `growth zscores + referral attendance`        | Menambah z-score dan status kehadiran rujukan      |
| 012 | `screening history`                           | Menambah riwayat screening                         |
| 013 | `email verification + examination completion` | Menambah verifikasi email dan completion timestamp |
| 014 | `active pregnancy constraint`                 | Membatasi satu kehamilan aktif                     |
| 015 | `active email verification backfill`          | Backfill verifikasi email user aktif               |

### Urutan Rollback

```text
015
 ↓
014
 ↓
013
 ↓
012
 ↓
011
 ↓
010
 ↓
009
 ↓
008
 ↓
007
 ↓
006
 ↓
005
 ↓
004
 ↓
003
 ↓
002
 ↓
001
```

> **Catatan:** Migration tertentu memiliki `down()` kosong, khususnya Migration #15.

---

# 16. Kesimpulan

Schema akhir berdasarkan **15 migration** terdiri dari:

``` text
14 tabel
13 model domain
15 migration
```

Fitur schema utama mencakup:

-   struktur wilayah `kecamatan → kelurahan`
-   `puskesmas → posyandu`
-   data `warga`
-   user dan role
-   profil kehamilan
-   sesi dan kunjungan Posyandu
-   pemeriksaan
-   growth z-score
-   screening history
-   imunisasi
-   rujukan
-   audit log
-   email OTP
-   email verification
-   examination completion tracking
-   unique active pregnancy

Dokumen ini menggunakan migration sebagai sumber utama untuk struktur
database.
