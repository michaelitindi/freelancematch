# Cleanup Guide - Local Files

Now that everything is deployed to Cloudflare, you can safely remove local-only files.

## ✅ Safe to Delete

### 1. Local SQLite Database
```
freelancematch.db
freelancematch.db-shm
freelancematch.db-wal
```
**Reason:** Now using Cloudflare D1 remote database

### 2. Old Database Client
```
src/lib/db.ts
```
**Reason:** Replaced by `src/lib/db-wrapper.ts` for D1

### 3. Mock Data Files
```
src/lib/mock-data.ts
src/lib/seed-db.ts
```
**Reason:** Real data now in D1, no longer needed

### 4. Backup Files
```
src/app/api/[[...route]]/route.ts.sqlite-backup
```
**Reason:** Original SQLite version (keep if you want rollback option)

### 5. Build Artifacts
```
worker/routes.ts
```
**Reason:** Generated file, rebuilt on each deploy

### 6. Test Files
```
test-avatar.txt
test-*.jpg
test-*.png
```
**Reason:** Temporary test files

## ⚠️ Keep These Files

### Migration Files (for reference)
```
migration.sql              # Database export
scripts/export-db.mjs      # Export utility
scripts/create-admin.mjs   # Admin creation
```
**Reason:** Useful for future migrations or creating new admins

### New D1 Files (in use)
```
src/lib/db-wrapper.ts      # D1 compatibility layer
src/lib/db-d1.ts           # D1 schema
wrangler.toml              # Cloudflare config
```
**Reason:** Required for current deployment

### Documentation
```
All *.md files
```
**Reason:** Project documentation

## 🧹 Automated Cleanup

Run the cleanup script:
```bash
./scripts/cleanup-local.sh
```

This will:
1. Create backups in `.backups/` directory
2. Remove local SQLite files
3. Remove old database client
4. Remove mock data files
5. Clean up test files

## 📦 Manual Cleanup

If you prefer manual cleanup:

```bash
# Remove local database
rm -f freelancematch.db freelancematch.db-shm freelancematch.db-wal

# Remove old database client
rm -f src/lib/db.ts

# Remove mock data
rm -f src/lib/mock-data.ts src/lib/seed-db.ts

# Remove backups (if you're confident)
rm -f src/app/api/[[...route]]/route.ts.sqlite-backup

# Remove test files
rm -f test-*.txt test-*.jpg test-*.png
```

## 🔄 Rollback Plan

If you need to rollback to local SQLite:

1. **Restore database:**
   ```bash
   cp .backups/freelancematch.db.backup freelancematch.db
   ```

2. **Restore old client:**
   ```bash
   cp .backups/db.ts.old src/lib/db.ts
   ```

3. **Restore old routes:**
   ```bash
   cp src/app/api/[[...route]]/route.ts.sqlite-backup src/app/api/[[...route]]/route.ts
   ```

4. **Run locally:**
   ```bash
   npm run dev
   ```

## 📊 Before vs After

### Before (Local)
```
freelancematch/
├── freelancematch.db          ❌ Delete
├── src/lib/db.ts              ❌ Delete
├── src/lib/mock-data.ts       ❌ Delete
└── src/lib/seed-db.ts         ❌ Delete
```

### After (Cloudflare)
```
freelancematch/
├── src/lib/db-wrapper.ts      ✅ Keep
├── src/lib/db-d1.ts           ✅ Keep
├── src/lib/r2.ts              ✅ Keep
├── worker/index.ts            ✅ Keep
├── wrangler.toml              ✅ Keep
└── migration.sql              ✅ Keep (reference)
```

## 🎯 Recommended Action

**Conservative Approach:**
1. Run cleanup script (creates backups)
2. Test remote API thoroughly
3. After 1 week of successful operation, delete backups

**Aggressive Approach:**
1. Run cleanup script
2. Delete backups immediately
3. Rely on git history if needed

## ✅ Verification

After cleanup, verify everything works:

```bash
# Test API
curl https://freelancematch-api.michaelitindi.workers.dev/users

# Test admin login
curl -X POST https://freelancematch-api.michaelitindi.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@freelancematch.com","password":"admin123"}'

# Test file upload
curl -X POST https://freelancematch-api.michaelitindi.workers.dev/upload/avatar \
  -F "file=@image.jpg"
```

## 📝 Updated .gitignore

The following patterns are now ignored:
```
*.db
*.db-shm
*.db-wal
.wrangler/
.backups/
test-*.txt
test-*.jpg
test-*.png
```

## 💾 Data Safety

Your data is safe in Cloudflare:
- **D1 Database:** Automatically replicated
- **R2 Storage:** Durable object storage
- **Backups:** Can export anytime with `wrangler d1 execute`

## 🚀 Next Steps

After cleanup:
1. Commit changes to git
2. Push to repository
3. Continue development with remote infrastructure
4. No more local database management!

---

**Ready to clean up?**
```bash
./scripts/cleanup-local.sh
```
