# POSYANDU Postman Documentation

Import these files into Postman:

- `POSYANDU-beta.postman_collection.json`
- `POSYANDU-beta.postman_environment.json`

Select the `POSYANDU-beta` environment. Set `base_url` to the backend API prefix (default `http://localhost:3000/api`) and `server_url` to the backend origin (default `http://localhost:3000`). The collection uses Bearer authentication with `{{token}}` for authenticated requests.

## Coverage

The collection contains all 65 operations registered under `/api`, plus the public `/health` operation, for 66 requests total. Requests are grouped into Health, Auth, Posyandu, Warga, Imunisasi, Sesi Posyandu, Users, Kehamilan, Kunjungan, Pemeriksaan, Rujukan, and Screening Config.

Every request has a Postman test script that checks the expected status code. JSON responses are checked for a `success` property and successful responses must set `success: true`. Export and upload requests are documented as binary or multipart operations and do not require a JSON response envelope.

## Recommended dependency order

1. Run `Auth / POST /auth/register`, verify the email OTP, and run `Auth / POST /auth/login`. The login script stores the token in `{{token}}`.
2. Use an approved account with the required role. Registration creates a pending account; an administrator must approve it before normal login/use.
3. Run `Posyandu / GET /posyandu` and set `{{posyandu_id}}` to an accessible ID if the default is not valid.
4. Run `Warga / POST /warga`. Its test script stores the returned ID in `{{warga_id}}` when the response exposes `data.id` or `data.user.id`.
5. Run `Sesi Posyandu / POST /sesi-posyandu`. Its test script stores `{{sesi_posyandu_id}}`.
6. Run `Kunjungan / POST /kunjungan` with the matching warga and open session. Its test script stores `{{kunjungan_id}}`.
7. Run `Pemeriksaan / POST /pemeriksaan`, then the Step 2, Step 3, Step 4, and Step 5 requests as applicable. The create script stores `{{pemeriksaan_id}}`; Step 5 can create a referral.
8. Query `Rujukan / GET /rujukan` or use a returned referral ID in `{{rujukan_id}}` for detail/export requests.

The collection also includes direct read/update requests for all implemented modules. Generic `:id` paths use the `{{id}}` environment variable; set it to the relevant resource ID before running those requests. Named paths use variables such as `{{warga_id}}`, `{{kunjungan_id}}`, and `{{rujukan_id}}`.

## Access and privacy

All authenticated routes require a valid JWT. Personal-data routes use the backend `denyDinkesPersonalData` middleware, so `dinkes` accounts are denied direct warga, visit, examination, pregnancy, immunization, and referral personal-data access where that middleware is registered. Aggregate/statistical routes and explicitly authorized administration/configuration routes retain their implemented role rules. The collection descriptions identify the role requirements per request.

## Swagger/OpenAPI mismatch report

Compared with the current implementation:

- The backend exposes `GET /health` outside `/api`; it is not part of the current OpenAPI path set. It is included as the collection's separate Health request using `{{server_url}}`.
- The current OpenAPI document covers the 65 `/api` operations, including the mutation routes, examination step routes, and screening-config routes. No additional `/api` route mismatch was found in the current route/OpenAPI parity check.
- The collection intentionally documents implementation details that OpenAPI schemas cannot fully express, including role middleware, privacy denial behavior, upload/export content types, multi-step dependencies, and response-driven variable chaining.

This documentation does not change backend source files.
