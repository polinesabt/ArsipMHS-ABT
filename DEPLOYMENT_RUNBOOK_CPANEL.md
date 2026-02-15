# Deployment Runbook (cPanel, Root Domain)

This runbook implements deployment for:

- Domain: `https://arsipmhs-abt.com`
- Frontend: Vite static build in `public_html/`
- API: PHP files in `public_html/database/backend/api`
- DB: MySQL import from `database/schema.sql` + `database/seed.sql`
- Cron: hourly reminder (`0 * * * *`)

## 1. Local Preparation

1. Install dependencies and build:
```bash
npm ci
npm run build
```
2. Verify build artifacts:
```bash
dir dist
```
Expected: `dist/index.html`, `dist/assets`, `dist/.htaccess`.

3. Generate new secrets:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-secrets.ps1 -WriteEnvSnippet
```
Use the generated `DB_PASS`, `JWT_SECRET`, and `CRON_SECRET` in production.

4. Build deploy bundle:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-release.ps1
```
Output: `release/arsipmhs2-cpanel-<timestamp>.zip`.

## 2. cPanel Backup (Before Cutover)

1. Backup current `public_html` (File Manager -> Compress -> Download).
2. Backup current production database (phpMyAdmin -> Export SQL).

## 3. Upload Files to `public_html`

1. Upload and extract `release/arsipmhs2-cpanel-<timestamp>.zip`.
2. Ensure resulting structure:

```text
public_html/
  index.html
  .htaccess
  assets/
  database/
    backend/
      api/
      config/
```

3. Confirm `public_html/database/backend/config/.htaccess` exists.

## 4. Production Environment File

Create `public_html/.env.production` with minimum keys:

```bash
VITE_API_BASE_URL=https://arsipmhs-abt.com/database/backend/api
VITE_API_TIMEOUT=10000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=<cpanel_db_name>
DB_USER=<cpanel_db_user>
DB_PASS=<rotated_db_password>
JWT_SECRET=<rotated_jwt_secret>
JWT_ALGORITHM=HS256
JWT_EXPIRATION=86400
CRON_SECRET=<rotated_cron_secret>
ALLOWED_ORIGIN=https://arsipmhs-abt.com
APP_ENV=production
```

Do not expose this file publicly.

## 5. Database Setup (phpMyAdmin)

1. Create DB and DB user from cPanel MySQL Database Wizard.
2. Grant all privileges.
3. Import in order:
   - `database/schema.sql`
   - `database/seed.sql`
4. Verify tables exist (`users`, `students`, `tracer_study`, `achievements`, evaluation tables).

## 6. Cron Setup (Hourly)

Create cPanel cron job:

```bash
0 * * * * curl -sS -X POST "https://arsipmhs-abt.com/database/backend/api/evaluations/cron_reminder.php" -H "X-CRON-SECRET: <CRON_SECRET>" -H "Content-Type: application/json" -d "{}" > /dev/null 2>&1
```

Run the same command once manually and confirm it is not `401`.

## 7. Go-Live Validation

1. Open `https://arsipmhs-abt.com`.
2. Refresh a deep SPA route (for example `/admin-dashboard`) and verify no 404.
3. Check API DB health:
   - `https://arsipmhs-abt.com/database/backend/api/test_db.php`
4. Login with seed admin account and verify dashboard data loads.
5. Verify list endpoints return `200` (`students`, `tracer`, `achievements`).
6. Verify env file is not accessible:
   - `https://arsipmhs-abt.com/.env.production` must return `403` or `404`.
7. Verify cron endpoint auth:
   - POST without `X-CRON-SECRET` must return `401` JSON.
   - POST with valid `X-CRON-SECRET` must return `200` JSON.

Optional scripted smoke test:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1 -Domain arsipmhs-abt.com
```
The script exits with non-zero code if any check fails.

## 8. Rollback

If smoke test fails:

1. Restore `public_html` backup.
2. Restore pre-deploy DB backup.
3. Re-run minimum checks (`/`, `test_db.php`, login).

## 9. Post-Deploy Hygiene

1. Keep real secrets out of git-tracked files.
2. Store production secrets in password manager/runbook only.
3. Rotate secrets again immediately if exposure is suspected.
