# API Reference

Source of truth: `routes/api.js`, the referenced controllers, validators, and middleware. Base path: `/api`.

## Conventions

- Protected routes require `Authorization: Bearer <JWT>`.
- `A` means all authenticated API roles: `kader`, `puskesmas`, `puskesmasAdmin`, `dinkes`, `dinkesAdmin`, and `sa`.
- `sa` is the canonical persisted role for the highest privilege. `superAdmin` is business terminology, not another accepted value.
- `page` defaults to `1`; `limit` defaults to `10` and is limited to `100` when pagination validation is used.
- Validation errors return `400` with `{ status: "error", message: "Validasi data gagal", errors: [{ field, message }] }`.
- Authentication errors return `401`; role denial returns `403`; missing or out-of-scope resources generally return `404`; duplicate resources return `409` where the controller handles them.
- Unexpected controller errors are forwarded to the server error handler and return `500` with `{ success: false, message: "Terjadi kesalahan pada server." }`.
- Dates use strict ISO-8601 input where a validator is attached. IDs must be positive integers.

## Runtime configuration

- Copy `.env.example` to `.env` for local setup. The template documents every environment variable read by the application.
- `CORS_ORIGIN` accepts comma-separated browser origins. Development may leave it empty; production must set explicit origins and cannot use `*`. Requests without an `Origin` header remain supported for health checks and server-to-server calls.
- `OTP_EXPIRES_MINUTES` controls OTP validity and `OTP_RESEND_COOLDOWN_MINUTES` controls the resend window. OTP codes remain six digits, matching the auth validators.
- Production startup fails closed when database, JWT, SMTP, or CORS configuration is missing. Unexpected errors return a generic `500` response; details are written to server logs only.

## Scope and authorization

`getPosyanduInclude` scopes relation queries as follows: `kader` is restricted to `user.posyandu_id`; `puskesmas` and `puskesmasAdmin` to `user.puskesmas_id`; `dinkes`, `dinkesAdmin`, and `sa` have global Posyandu scope. Some mutation controllers apply stricter rules described per endpoint.

## Auth

All Auth routes below are **public**, except logout.

### `POST /auth/register`

- **Purpose:** Create a pending user account and send registration OTP.
- **Path/query:** None.
- **Body:** Required `role` (`kader`, `puskesmas`, or `dinkes`), `email`, `password` (8-72 chars), `nama_lengkap` (2-100 chars). Optional `telepon` (max 20), `nik` (16 digits), `puskesmas_id`, `posyandu_id`.
- **Success:** `201`, `{ success: true, message, data: { id, email, role, status } }`; status is `pending_approval`.
- **Errors:** `400` duplicate email/NIK; `403` unsupported self-registration role; `500` unexpected error.

### `POST /auth/verify-otp`

- **Purpose:** Verify registration or password-reset OTP.
- **Path/query:** None.
- **Body:** Required `email`, `otp_code` (6 digits), `purpose` (`register` or `reset_password`).
- **Success:** `200`, `{ success: true, message }`.
- **Errors:** `400` invalid/expired/used OTP or invalid body.

### `POST /auth/resend-otp`

- **Purpose:** Issue and email a new OTP.
- **Path/query:** None.
- **Body:** Required `email`, `purpose` (`register` or `reset_password`).
- **Success:** `200`, `{ success: true, message }`.
- **Errors:** `400` invalid purpose/body; `429` request made within the one-minute resend window.

### `POST /auth/login`

- **Purpose:** Authenticate an active user and issue a JWT.
- **Path/query:** None.
- **Body:** Required `email`, `password`.
- **Success:** `200`, `{ success: true, message, data: { token, user } }`.
- **Errors:** `400` invalid body; `401` wrong email/password; `403` pending, inactive, or otherwise non-active account.

### `POST /auth/request-reset-password`

- **Purpose:** Request a password-reset OTP. The response is intentionally generic when the email is unknown.
- **Path/query:** None.
- **Body:** Required `email`.
- **Success:** `200`, generic `{ success: true, message }`.
- **Errors:** `400` invalid email.

### `POST /auth/reset-password`

- **Purpose:** Verify reset OTP and replace the password.
- **Path/query:** None.
- **Body:** Required `email`, `otp_code` (6 digits), `new_password` (8-72 chars).
- **Success:** `200`, `{ success: true, message }`.
- **Errors:** `400` invalid/expired OTP or invalid body; `404` user not found.

### `POST /auth/logout`

- **Authentication:** Protected; any authenticated user.
- **Purpose:** Increment the user's token version and invalidate the current token lineage.
- **Path/query/body:** None.
- **Success:** `200`, `{ success: true, message }`.
- **Errors:** `401` missing/invalid token; `403` invalid JWT or inactive account; `500` unexpected error.

## Posyandu

### `GET /posyandu`

- **Authentication/role:** Protected; A.
- **Purpose:** Paginated Posyandu list with search and region filters.
- **Query:** `page`, `limit`, `search` (max 100), `puskesmas_id`, `kecamatan_id`.
- **Path/body:** None.
- **Success:** `200`, `{ success: true, message, data, pagination }`.
- **Errors:** `400` invalid query; `401/403` authentication/authorization; `500` unexpected error.
- **Scope:** Kader sees its Posyandu; Puskesmas roles see Posyandu in their Puskesmas; Dinkes roles and `sa` are global. Non-Puskesmas-scoped users may apply `puskesmas_id`.

### `GET /posyandu/:id`

- **Authentication/role:** Protected; A.
- **Purpose:** Return one Posyandu with Puskesmas and Kelurahan/Kecamatan relations.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `404` missing or out-of-scope Posyandu; `401/403` auth errors.
- **Scope:** Same Posyandu scope rules as the list endpoint.

## Warga

Common Warga fields: `nik` is 16 digits; `nama_lengkap` is 2-100 chars; `jenis_kelamin` is `L` or `P`; `tanggal_lahir` is strict ISO; `status_perkawinan` is `menikah` or `tidak_menikah`; `status_domisili` is `aktif`, `pindah`, or `meninggal`.

### `GET /warga`

- **Authentication/role:** Protected; A.
- **Purpose:** Paginated resident/target list with dynamic ILP category.
- **Query:** `page`, `limit`, `search`, `posyandu_id`, `jenis_kelamin`, `kategori_sasaran`, `category`, `status_domisili` (`all`, `aktif`, `pindah`, `meninggal`), `rt`, `rw`.
- **Path/body:** None.
- **Success:** `200`, `{ success: true, message, data, pagination }`; each row may include `umur_text`, `usia_bulan`, `usia_tahun`, and `kategori_sasaran_saat_ini`.
- **Errors:** `400` invalid query or category; `401/403`; `500`.
- **Scope:** Kader is restricted to its Posyandu. Puskesmas roles are restricted to their Puskesmas. Dinkes roles and `sa` are global. A kader's `posyandu_id` query filter does not override its scope.

### `GET /warga/export`

- **Authentication/role:** Protected; A.
- **Purpose:** Export scoped Warga data as an Excel attachment.
- **Query:** Same filters as `GET /warga`: `posyandu_id`, `kategori_sasaran` or `category`, `status_domisili`, `search`; list pagination fields are accepted by the route validator but are not used by the exporter.
- **Path/body:** None.
- **Success:** `200`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, attachment `Data_Warga_ILP_<date>.xlsx`.
- **Errors:** `400` invalid filters; `401/403`; `500` export failure.
- **Scope:** Same `getRoleScope` rules as `GET /warga`; a kader cannot select another Posyandu.

### `GET /warga/statistik-sasaran`

- **Authentication/role:** Protected; A.
- **Purpose:** Count active Warga by dynamic ILP target category.
- **Path/query/body:** None.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `401/403`; `500` unexpected error.
- **Scope:** Only active Warga inside the authenticated user's Posyandu/Puskesmas scope are counted.

### `GET /warga/:id`

- **Authentication/role:** Protected; A.
- **Purpose:** Return Warga detail, pregnancy profile, recent visits, age, and current category.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `404` missing/out-of-scope Warga; `401/403`.
- **Scope:** Same Warga scope rules as `GET /warga`.

### `POST /warga`

- **Authentication/role:** Protected; route allows A, but controller mutation is allowed to `kader`, `sa`, and any role not in the read-only list only if its Posyandu scope passes. `puskesmas`, `puskesmasAdmin`, `dinkes`, and `dinkesAdmin` are explicitly read-only and receive `403`.
- **Purpose:** Create a resident record.
- **Path/query:** None.
- **Body:** Required `nik`, `nama_lengkap`, `jenis_kelamin`, `tanggal_lahir`, and `posyandu_id` for non-kader roles. Optional `alamat`, `rt`, `rw`, `telepon`, `nama_ibu`, `nama_ayah`, `status_perkawinan`, `pekerjaan`, `pekerjaan_lainnya`, `bb_lahir_kg`, `tb_lahir_cm`, `status_domisili`.
- **Success:** `201`, `{ success: true, message, data }`.
- **Errors:** `400` missing/invalid fields; `403` read-only role; `404` Posyandu missing/out of scope; `409` duplicate NIK; `401/500`.
- **Scope:** Kader's target Posyandu is taken from `req.user.posyandu_id`, not an arbitrary body value. Other writable roles must pass `canAccessPosyandu`.

### `PUT /warga/:id`

- **Authentication/role:** Protected; route allows A, but Puskesmas/Dinkes roles are read-only and get `403`; kader may update only its own Posyandu.
- **Purpose:** Partial update of resident profile fields.
- **Path:** Required positive `id`. Query: none.
- **Body:** All fields are optional: `nik`, `nama_lengkap`, `jenis_kelamin`, `tanggal_lahir`, `alamat`, `rt`, `rw`, `telepon`, `nama_ibu`, `nama_ayah`, `status_perkawinan`, `pekerjaan`, `pekerjaan_lainnya`, `bb_lahir_kg`, `tb_lahir_cm`, `status_domisili`. `posyandu_id` is not accepted by the update validator/controller.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid fields; `403` read-only or out-of-scope kader; `404` Warga not found; `409` duplicate NIK; `401/500`.
- **Scope:** Existing Warga is loaded through the authenticated Posyandu scope.

### `PATCH /warga/:id/status-domisili`

- **Authentication/role:** Protected; route allows A, but only writable roles may change status; Puskesmas/Dinkes roles receive `403`; kader is limited to its Posyandu.
- **Purpose:** Change soft-status `status_domisili`.
- **Path:** Required positive `id`. Body required `status_domisili`: `aktif`, `pindah`, or `meninggal`. Query: none.
- **Success:** `200`, `{ success: true, message, data: { id, nama_lengkap, status_domisili } }`.
- **Errors:** `400` invalid status/ID; `403` role or scope denial; `404` Warga not found; `401/500`.

### `POST /warga/mutasi/verify`

- **Authentication/role:** Protected route A, but controller allows only `kader` with a destination `posyandu_id`; otherwise `403`.
- **Purpose:** Verify a resident identity before mutation.
- **Body:** Required `nik`, `nama_lengkap`, `nama_ibu`. Query/path: none.
- **Success:** `200`, `{ success: true, message, data: { id, nik, nama_lengkap, nama_ibu, posyandu_saat_ini, posyandu_tujuan } }`.
- **Errors:** `400` invalid body; `403` non-kader/no valid destination; `404` identity not found; `401/500`.
- **Scope:** Destination is the kader's own Posyandu; source lookup must match NIK, name, and mother's name.

### `PATCH /warga/mutasi/confirm`

- **Authentication/role:** Protected route A, but controller allows only `kader` with a valid destination Posyandu; otherwise `403`.
- **Purpose:** Commit a verified resident mutation in a transaction.
- **Body:** Required `warga_id`, `nik`, `nama_lengkap`, `nama_ibu`. Query/path: none.
- **Success:** `200`, `{ success: true, message, data: { id, nik, nama_lengkap, posyandu_id } }`. If already at the destination, the operation remains successful with an explanatory message.
- **Errors:** `400` invalid body; `403` invalid role/destination; `404` identity mismatch; `401/500`.
- **Scope/transaction:** Row is locked and moved only to the authenticated kader's destination Posyandu; rollback occurs on failure.

## Imunisasi

### `GET /imunisasi/warga/:warga_id`

- **Authentication/role:** Protected; A.
- **Purpose:** List immunizations for one scoped Warga.
- **Path:** Required positive `warga_id`. Query/body: none.
- **Success:** `200`, `{ success: true, message, data }` ordered newest first.
- **Errors:** `400` invalid ID; `404` missing/out-of-scope Warga; `401/403/500`.
- **Scope:** Warga is resolved through Posyandu scope before immunizations are queried.

### `GET /imunisasi/:id`

- **Authentication/role:** Protected; A.
- **Purpose:** Return one immunization with its scoped Warga.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `404` missing/out-of-scope immunization; `401/403/500`.

### `POST /imunisasi`

- **Authentication/role:** Protected; A.
- **Purpose:** Add an immunization record.
- **Body:** Required `warga_id`, `jenis_imunisasi` (non-empty, max 100), `tanggal_imunisasi` (strict ISO). Path/query: none.
- **Success:** `201`, `{ success: true, message, data }`.
- **Errors:** `400` invalid body; `404` missing/out-of-scope Warga; `401/403/500`.
- **Scope:** `warga_id` must resolve inside the authenticated user's Posyandu/Puskesmas scope.

### `PUT /imunisasi/:id`

- **Authentication/role:** Protected; A.
- **Purpose:** Partial update of an immunization.
- **Path:** Required positive `id`. Body optional `jenis_imunisasi` (non-empty, max 100) and/or `tanggal_imunisasi` (strict ISO). Query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid body/ID; `404` missing/out-of-scope immunization; `401/403/500`.

## Sesi Posyandu

### `GET /sesi-posyandu`

- **Authentication/role:** Protected; A.
- **Purpose:** Paginated session list.
- **Query:** `page`, `limit`, `posyandu_id`, `status` (`open`/`closed`), `tanggal` (strict ISO). Path/body: none.
- **Success:** `200`, `{ success: true, message, data, pagination }`.
- **Errors:** `400` invalid query; `401/403/500`.
- **Scope:** Results include only sessions whose Posyandu is visible to the user.

### `GET /sesi-posyandu/:id`

- **Authentication/role:** Protected; A.
- **Purpose:** Return one session.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `404` missing/out-of-scope session; `401/403/500`.

### `POST /sesi-posyandu`

- **Authentication/role:** Protected route A, but controller allows only `kader` or `sa`.
- **Purpose:** Create a Posyandu session.
- **Body:** Required `posyandu_id`, `tanggal_pelaksanaan` (strict ISO), `lokasi` (non-empty, max 255), `rw` (non-empty, max 5), `status` (`open`/`closed`). Path/query: none.
- **Success:** `201`, `{ success: true, message, data }`.
- **Errors:** `400` invalid body; `403` role/scope denial; `409` duplicate Posyandu/date; `401/500`.
- **Scope:** Target Posyandu must be accessible to the kader or `sa`.

### `PUT /sesi-posyandu/:id`

- **Authentication/role:** Protected route A, but controller allows only `kader` or `sa`.
- **Purpose:** Partial update of a non-closed session.
- **Path:** Required positive `id`. Body optional `posyandu_id`, `tanggal_pelaksanaan`, `lokasi`, `rw`, `status`; query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid body, closed session, or invalid state; `403` role/scope denial; `404` missing/out-of-scope session; `409` duplicate Posyandu/date; `401/500`.

### `PATCH /sesi-posyandu/:id/status`

- **Authentication/role:** Protected route A, but controller allows only `kader` or `sa`.
- **Purpose:** Change a non-closed session's status.
- **Path:** Required positive `id`. Body required `status` (`open`/`closed`). Query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid status or already-closed session; `403` role/scope denial; `404` missing/out-of-scope session; `401/500`.

## User

### `PATCH /users/:id/verify`

- **Authentication/role:** Protected; `puskesmasAdmin`, `dinkesAdmin`, `sa`.
- **Purpose:** Approve a user account.
- **Path:** Required positive `id`. Body/query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `403` self-target or target-role scope denial; `404` user not found; `401/500`.
- **Scope:** `sa` can verify `dinkes`, `puskesmas`, and `kader`; `dinkesAdmin` can verify `dinkes`/`puskesmas`; `puskesmasAdmin` can verify same-Puskesmas `puskesmas`/`kader`.

### `PATCH /users/:id/deactivate`

- **Authentication/role:** Protected; `puskesmasAdmin`, `dinkesAdmin`, `sa`.
- **Purpose:** Set a target user inactive.
- **Path:** Required positive `id`. Body/query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `403` self-target or authorization denial; `404` user not found; `401/500`.
- **Scope:** `sa` is global; `dinkesAdmin` may target `dinkes`; `puskesmasAdmin` may target same-Puskesmas `puskesmas`/`kader`.

### `PUT /users/:id/puskesmas-admin`

- **Authentication/role:** Protected; `dinkesAdmin`, `sa`.
- **Purpose:** Replace the Puskesmas administrator for the target's Puskesmas in a transaction.
- **Path:** Required positive `id` identifying the replacement user. Body/query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `403` self-target, invalid target, or role/scope denial; `404` replacement user not found; `401/500`.
- **Scope:** Target must be a `puskesmas` user with a non-null `puskesmas_id`; only `sa` and `dinkesAdmin` may perform it.

### `PUT /users/:id/dinkes-admin`

- **Authentication/role:** Protected; `dinkesAdmin`, `sa`.
- **Purpose:** Replace the Dinkes administrator in a transaction.
- **Path:** Required positive `id` identifying the replacement user. Body/query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `403` self-target, invalid target, or role denial; `401/500`.
- **Scope:** Target must be a `dinkes` user; existing `dinkesAdmin` users are demoted.

### `GET /users/me`

- **Authentication/role:** Protected; any authenticated user.
- **Purpose:** Return the current profile without password/token-version fields.
- **Path/query/body:** None.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `401/403/500`.

### `PATCH /users/me`

- **Authentication/role:** Protected; any authenticated user.
- **Purpose:** Update the current profile.
- **Body:** Optional `nama_lengkap` (2-100), `telepon` (max 20), `nik` (16 digits or null). Path/query: none.
- **Success:** `200`, `{ success: true, message, data }` without password/token version.
- **Errors:** `400` invalid body; `401/403/500`.

### `POST /users/me/profile-picture`

- **Authentication/role:** Protected; any authenticated user.
- **Purpose:** Upload a profile image using the configured multipart upload middleware.
- **Body:** Multipart file field as required by `uploadProfilePicture`; no JSON field is defined in this route.
- **Success:** `200`, `{ success: true, message, data: { profile_picture } }`.
- **Errors:** `400` no file; `401/403`; upload or server errors may return `500`.

### `GET /users`

- **Authentication/role:** Protected; `puskesmasAdmin`, `dinkesAdmin`, `sa`.
- **Purpose:** Paginated user administration list.
- **Query:** `page`, `limit`, `search`, `role` (`kader`, `puskesmas`, `puskesmasAdmin`, `dinkes`, `dinkesAdmin`, `sa`), `status` (`pending_approval`, `rejected`, `active`, `inactive`), `puskesmas_id`, `posyandu_id`.
- **Path/body:** None.
- **Success:** `200`, `{ success: true, message, data, pagination }`; password/token version are excluded.
- **Errors:** `400` invalid filters; `401/403/500`.
- **Scope:** `sa` and `dinkesAdmin` are global; `puskesmasAdmin` is restricted to its Puskesmas.

### `GET /users/:id`

- **Authentication/role:** Protected; `puskesmasAdmin`, `dinkesAdmin`, `sa`.
- **Purpose:** Return one user without password/token version.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `404` missing/out-of-scope user; `401/403/500`.

### `PATCH /users/:id/role`

- **Authentication/role:** Protected; `sa` only.
- **Purpose:** Change a subordinate user's role and invalidate its old token.
- **Path:** Required positive `id`. Body required `role` (`kader`, `puskesmas`, `puskesmasAdmin`, `dinkes`, `dinkesAdmin`, `sa`). Query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid body/ID; `403` self-target, target `sa`, or invalid role transition; `404` is represented by the controller as `403` when target is absent/unauthorized; `401/500`.

### `PATCH /users/:id/status`

- **Authentication/role:** Protected; `puskesmasAdmin`, `dinkesAdmin`, `sa`.
- **Purpose:** Set a user's status.
- **Path:** Required positive `id`. Body required `status` (`pending_approval`, `rejected`, `active`, `inactive`). Query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid body/ID; `403` self-target or authorization denial; `404` target is represented by the controller as `403` in the unauthorized branch; `401/500`.

## Kehamilan

### `GET /kehamilan/warga/:warga_id`

- **Authentication/role:** Protected; A.
- **Purpose:** List pregnancy profiles for one scoped Warga.
- **Path:** Required positive `warga_id`. Query/body: none.
- **Success:** `200`, `{ success: true, message, data }` ordered newest first.
- **Errors:** `400` invalid ID; `404` missing/out-of-scope Warga; `401/403/500`.

### `GET /kehamilan/:id`

- **Authentication/role:** Protected; A.
- **Purpose:** Return one pregnancy profile.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `404` missing/out-of-scope profile; `401/403/500`.

### `POST /kehamilan`

- **Authentication/role:** Protected; A.
- **Purpose:** Create a pregnancy profile for a scoped Warga.
- **Body:** Required `warga_id`. Optional `nama_suami`, `hpht`, `hpl`, `tanggal_persalinan` (ISO), `anak_ke` (positive integer), `jarak_anak_sebelum_bulan` (integer >= 0), `cara_persalinan` (`normal`/`dengan_tindakan`), `status_kehamilan` (`hamil`/`nifas`/`menyusui`/`selesai`), `is_menyusui`.
- **Success:** `201`, `{ success: true, message, data }`.
- **Errors:** `400` invalid field or invalid status/date combination; `404` Warga missing/out of scope; `401/403/500`.
- **Business validation:** `menyusui` requires `is_menyusui=true` and `tanggal_persalinan`; `nifas` also requires `tanggal_persalinan`; `hamil` cannot have `tanggal_persalinan`; HPL/persalinan cannot precede HPHT.

### `PUT /kehamilan/:id`

- **Authentication/role:** Protected; A.
- **Purpose:** Partial update of a pregnancy profile.
- **Path:** Required positive `id`. Body optional fields from the create endpoint except `warga_id`; query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid field/combination; `404` missing/out-of-scope profile; `401/403/500`.

### `PATCH /kehamilan/:id/status`

- **Authentication/role:** Protected; A.
- **Purpose:** Update pregnancy status and related postpartum fields.
- **Path:** Required positive `id`. Body required `status_kehamilan`; optional `is_menyusui`, `tanggal_persalinan`. Query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid status/body or invalid status combination; `404` missing/out-of-scope profile; `401/403/500`.

## Kunjungan

### `POST /kunjungan`

- **Authentication/role:** Protected; A.
- **Purpose:** Register a Warga into an open session (Step 1) and allocate an `A-001`-style queue number.
- **Body:** Required `warga_id`, `sesi_posyandu_id`. Path/query: none.
- **Success:** `201`, `{ success: true, message, data: { kunjungan_id, nomor_antrean, status_langkah, warga } }`.
- **Errors:** `400` closed session or duplicate registration; `404` session/Warga missing; `401/403/500`.
- **Scope:** Session is loaded through the authenticated Posyandu scope.

### `GET /kunjungan/antrean-hari-ini`

- **Authentication/role:** Protected; A.
- **Purpose:** List today's queue for frontend Step 2/4/5 selection.
- **Query:** Optional `sesi_posyandu_id`, `search` (name/NIK search). Path/body: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid query; `401/403/500`.
- **Scope:** Includes only sessions in the authenticated Posyandu/Puskesmas scope.

### `GET /kunjungan`

- **Authentication/role:** Protected; A.
- **Purpose:** Paginated visit history.
- **Query:** `page`, `limit`, `search`, `sesi_posyandu_id`, `status_langkah` (`langkah_1` through `langkah_5`), `start_date`, `end_date`.
- **Path/body:** None.
- **Success:** `200`, `{ success: true, message, data, pagination }`.
- **Errors:** `400` invalid filters; `401/403/500`.
- **Scope:** Session relation enforces Posyandu/Puskesmas scope.

### `GET /kunjungan/:id`

- **Authentication/role:** Protected; A.
- **Purpose:** Visit detail with Warga, session, and examination relations.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `404` missing/out-of-scope visit; `401/403/500`.

### `PATCH /kunjungan/:id/status-langkah`

- **Authentication/role:** Protected; A.
- **Purpose:** Manually move the visit between `langkah_1` and `langkah_5`.
- **Path:** Required positive `id`. Body required `status_langkah` (`langkah_1`, `langkah_2`, `langkah_3`, `langkah_4`, `langkah_5`). Query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid status/ID; `404` missing/out-of-scope visit; `401/403/500`.

### `DELETE /kunjungan/:id`

- **Authentication/role:** Protected; A.
- **Purpose:** Cancel a visit/registration.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `{ success: true, message }`.
- **Errors:** `400` kader cannot cancel a visit in a closed session; `404` missing/out-of-scope visit; `401/403/500`.

## Pemeriksaan

All Pemeriksaan routes use role set A. Kader mutations are additionally checked by the session rule: the session cannot be before today, more than seven days old, or closed. Read routes use the session's Posyandu relation for scope.

### `GET /pemeriksaan`

- **Purpose:** Paginated examination list.
- **Query:** `page`, `limit`, `search` (name/NIK), `kategori_sasaran` (`bumil`, `busui`, `bayi`, `balita`, `apras`, `uskrem_6_14`, `uskrem_15_18`, `dewasa`, `lansia`), `sesi_posyandu_id`, `posyandu_id`, `warga_id`, `start_date`, `end_date`.
- **Path/body:** None.
- **Success:** `200`, `{ success: true, message, data, pagination }`.
- **Errors:** `400` invalid filters/category; `401/403/500`.
- **Scope:** Session Posyandu relation limits visible records.

### `GET /pemeriksaan/:id`

- **Purpose:** Return full examination detail and related Warga/session/pregnancy data.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `404` missing/out-of-scope examination; `401/403/500`.

### `GET /pemeriksaan/:id/step-3`

- **Purpose:** Read-only plotting/evaluation derived from Step 2 measurements.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `{ success: true, message, data }` containing the stored measurements and plot/evaluation output.
- **Errors:** `400` invalid ID; `404` missing/out-of-scope examination; `401/403/500`.
- **Dependency:** Step 2 must have supplied the measurements used by this read-only calculation; this endpoint does not write them.
- **Additional data:** `z_scores`, `growth_history`, `usia_kehamilan` (when HPHT exists), and `screening_eligibility` are included without removing existing fields.

### `GET /pemeriksaan/:id/screening-history`

- **Purpose:** Return repeated screening submissions for the examination's Warga.
- **Success:** `200`, `{ success: true, data: { last_filled_at, latest, history } }`; history is sorted newest first.
- **Scope:** Protected and scoped through the examination's session Posyandu.

### `POST /pemeriksaan`

- **Purpose:** Create or obtain the examination record for a visit and initialize its category/age values.
- **Body:** Required `kunjungan_id`. Optional `kategori_sasaran`, `tanggal`, `profile_kehamilan_id`, `detail_skrining` object, `is_skrining_tahunan`, measurement fields `bb_kg`, `tb_cm`, `lingkar_kepala_cm`, `lila_cm`, `lingkar_perut_cm`, `td_sistole`, `td_diastole`, `kadar_gula`, and output fields `topik_penyuluhan`, `is_perlu_rujukan`, `alasan_rujukan`.
- **Path/query:** None.
- **Success:** `201` when a new record is created, `{ success: true, message, data }`; an existing record is returned with the controller's existing success status when reused.
- **Errors:** `400` invalid measurements/category/screening; `404` missing/out-of-scope visit; `401/403/500`.
- **Scope:** Kader session mutation rule applies; other roles are scoped by the session relation.

### `POST /pemeriksaan/step-2`

- **Purpose:** Save measurement data for Step 2 and advance the visit to at least `langkah_2`.
- **Body:** Required `kunjungan_id`. Optional numeric measurements: `bb_kg` (0.01-999.99), `tb_cm` (0.01-999.99), `lingkar_kepala_cm` (0.01-99.99), `lila_cm` (0.01-99.99), `lingkar_perut_cm` (0.01-999.99), `td_sistole`/`td_diastole` (1-300), `kadar_gula` (0-9999).
- **Path/query:** None.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid measurement or session state; `404` missing/out-of-scope visit; `401/403/500`.
- **Dependency:** Requires a visit from Step 1; creates/reuses its Pemeriksaan record and supplies the values consumed by Step 3.

### `POST /pemeriksaan/step-4`

- **Purpose:** Save and score screening answers and advance the visit to at least `langkah_4`.
- **Body:** Required `kunjungan_id`. Optional `detail_skrining` JSON object, `is_skrining_tahunan` boolean, and `profile_kehamilan_id`.
- **Path/query:** None.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid screening/category/scoring; `404` missing/out-of-scope visit; `401/403/500`.
- **Dependency:** Uses the examination/category established by earlier steps. Its scored `detail_skrining` is read by Step 5 to derive referral reasons.
- **History:** Repeated annual submissions are retained in `screening_history`; same-year submissions are not blocked or overwritten.

### `POST /pemeriksaan/step-5`

- **Purpose:** Save education, finalize the examination, and create/update/delete its Rujukan.
- **Body:** Required `kunjungan_id`. Optional `topik_penyuluhan` (max 500), `is_perlu_rujukan` boolean, `alasan_rujukan` (max 1000), `status_kehadiran_rujukan` (`hadir`/`tidak_hadir`). Path/query: none.
- **Success:** `200`, `{ success: true, message, data, rujukan }`; visit status becomes `langkah_5`.
- **Errors:** `400` missing manual reason when referral is explicitly true without a screening trigger, missing Warga Puskesmas, invalid body/session; `404` missing/out-of-scope visit; `401/403/500`.
- **Dependency/transaction:** Requires the Step 4 screening state when referral reasons are derived. Known true screening triggers override a manual reason. The examination and Rujukan mutation run in one transaction; `true` creates/updates Rujukan, `false` deletes it.

### `PUT /pemeriksaan/:id`

- **Purpose:** Partial examination update, including measurements, screening, education, and referral decision.
- **Path:** Required positive `id`. Body optional `kategori_sasaran`, `tanggal`, `is_skrining_tahunan`, `profile_kehamilan_id`, all measurement fields, `detail_skrining`, `topik_penyuluhan`, `is_perlu_rujukan`, and `alasan_rujukan`. Query: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid category/measurement/screening, missing manual referral reason, missing Puskesmas, or kader session rule; `404` missing/out-of-scope examination; `401/403/500`.
- **Dependency/transaction:** Recalculates age/category and scores screening when supplied. Referral `true` creates/updates the unique Rujukan for the examination; `false` removes it. Examination and Rujukan changes are committed or rolled back together.

### `DELETE /pemeriksaan/:id`

- **Purpose:** Delete an examination.
- **Authentication/role:** Protected; A, with the kader session mutation rule.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `{ success: true, message }`.
- **Errors:** `400` kader session restriction; `404` missing/out-of-scope examination; `401/403/500`.

### Pemeriksaan flow

1. `POST /kunjungan` registers the Warga as Step 1.
2. `POST /pemeriksaan/step-2` stores measurements and establishes the data used by Step 3.
3. `GET /pemeriksaan/:id/step-3` calculates the read-only plot/evaluation.
4. `POST /pemeriksaan/step-4` stores and scores screening data.
5. `POST /pemeriksaan/step-5` stores education, decides referral, synchronizes Rujukan, and marks the visit complete at `langkah_5`.

## Rujukan

Rujukan has no public create/update/delete route. Its lifecycle is controlled by examination Step 5 and examination update.

### `GET /rujukan`

- **Authentication/role:** Protected; A.
- **Purpose:** Paginated referral list.
- **Query:** `page`, `limit`, `search` (Warga name/NIK), `puskesmas_id`, `kader_id`, `start_date`, `end_date`.
- **Path/body:** None.
- **Success:** `200`, `{ success: true, message, data, pagination }`; rows include Warga, Pemeriksaan, Puskesmas, and kader relations.
- **Errors:** `400` invalid filters; `401/403/500`.
- **Scope:** The Warga -> Posyandu relation is filtered through `getPosyanduInclude`, so a record outside the user's Posyandu/Puskesmas scope is excluded.
- **Filtering:** Dates filter `tanggal_rujukan`; `puskesmas_id` and `kader_id` filter their foreign keys; `search` applies to Warga name or NIK.

### `GET /rujukan/:id`

- **Authentication/role:** Protected; A.
- **Purpose:** Return one referral and its related records.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `{ success: true, message, data }`.
- **Errors:** `400` invalid ID; `404` missing or out-of-scope Rujukan; `401/403/500`.
- **Scope:** Same Warga -> Posyandu scope rule as the list endpoint.

### `GET /rujukan/:id/export`

- **Authentication/role:** Protected; A.
- **Purpose:** Export one scoped referral as a PDF attachment.
- **Path:** Required positive `id`. Query/body: none.
- **Success:** `200`, `Content-Type: application/pdf`, attachment `Rujukan_<id>.pdf`. The PDF contains Warga name/NIK, referral date, referral reason, Puskesmas, kader, and related examination ID/date/category.
- **Errors:** `400` invalid ID; `404` missing or out-of-scope Rujukan; `401/403/500`.
- **Scope:** Uses the same includes and Warga -> Posyandu scope check as the detail endpoint.

### Rujukan lifecycle

- Step 5 derives neutral reasons from known true screening triggers. If no trigger exists and `is_perlu_rujukan=true`, `alasan_rujukan` is required.
- `true` creates a Rujukan when none exists or updates the existing unique Rujukan for the examination.
- `false` removes the Rujukan and sets `Pemeriksaan.is_perlu_rujukan=false`.
- The Step 5 and examination-update mutations use a transaction. Rujukan create/update/delete audit events are recorded after a successful commit.

## Route coverage check

This document covers all **61 routes** currently registered in `routes/api.js`: Auth (7), Posyandu (2), Warga (9), Imunisasi (4), Sesi Posyandu (5), User (11), Kehamilan (5), Kunjungan (6), Pemeriksaan (9), and Rujukan (3).

Details not exposed by source are intentionally not specified here, including the exact multipart field name accepted by `uploadProfilePicture` and the internal subfield schema of `detail_skrining`; those are not declared by the route validator/controller contract.
