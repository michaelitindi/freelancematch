# FreelanceMatch Migration Guide

## Step 1: Admin Role Implementation ✅ COMPLETED

### Changes Made:

1. **Type Updates** (`src/types/index.ts`)
   - Added `'admin'` to `UserRole` type

2. **API Routes** (`src/app/api/[[...route]]/route.ts`)
   - Added `adminOnly` middleware
   - Added admin routes:
     - `POST /api/admin/courses` - Create course
     - `PATCH /api/admin/courses/:id` - Update course
     - `DELETE /api/admin/courses/:id` - Delete course
     - `PATCH /api/admin/kyc/:userId/approve` - Approve KYC
     - `PATCH /api/admin/kyc/:userId/reject` - Reject KYC
     - `GET /api/admin/kyc/pending` - List pending KYC
     - `PATCH /api/admin/reviews/:id/moderate` - Moderate review
     - `GET /api/admin/reviews/flagged` - List flagged reviews
     - `GET /api/admin/stats` - Dashboard statistics

3. **Admin Dashboard Component** (`src/components/admin/admin-dashboard.tsx`)
   - KYC approval interface
   - Review moderation interface
   - Statistics overview
   - Course management placeholder

4. **Admin User Script** (`scripts/create-admin.mjs`)
   - Creates admin user with credentials

### Admin User Created:
- **Email:** admin@freelancematch.com
- **Password:** admin123
- **ID:** 76f86f75-b273-46a2-8f63-7bebd0bdaf78

### Testing:
```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@freelancematch.com","password":"admin123"}'

# Get admin stats
curl http://localhost:3000/api/admin/stats \
  -H "Cookie: fm_session=YOUR_TOKEN"
```

---

## Step 2: Cloudflare D1 Migration (TODO)

### Prerequisites:
- Cloudflare account
- Wrangler CLI installed: `npm install -g wrangler`
- D1 database created: `wrangler d1 create freelancematch-db`

### Migration Steps:

1. **Install D1 Dependencies**
```bash
npm install @cloudflare/workers-types
```

2. **Create `wrangler.toml`**
```toml
name = "freelancematch"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "freelancematch-db"
database_id = "YOUR_DATABASE_ID"
```

3. **Export SQLite Data**
```bash
sqlite3 freelancematch.db .dump > schema.sql
```

4. **Import to D1**
```bash
wrangler d1 execute freelancematch-db --file=schema.sql
```

5. **Update Database Client** (`src/lib/db.ts`)
   - Replace `better-sqlite3` with D1 bindings
   - Convert synchronous calls to async
   - Update all `db.prepare().run()` to `await env.DB.prepare().run()`

6. **Update API Routes**
   - Add async/await to all database operations
   - Update Hono context to include D1 binding

7. **Deploy to Cloudflare Pages**
```bash
npm run build
wrangler pages deploy .next
```

---

## Step 3: Cloudflare R2 Storage (TODO)

### Prerequisites:
- R2 bucket created: `wrangler r2 bucket create freelancematch-files`

### Migration Steps:

1. **Update `wrangler.toml`**
```toml
[[r2_buckets]]
binding = "FILES"
bucket_name = "freelancematch-files"
```

2. **Create Upload Handler** (`src/lib/r2.ts`)
```typescript
export async function uploadToR2(
  env: any,
  file: File,
  path: string
): Promise<string> {
  const key = `${path}/${Date.now()}-${file.name}`;
  await env.FILES.put(key, file);
  return `https://files.yourdomain.com/${key}`;
}
```

3. **Add Upload Routes**
   - `POST /api/upload/avatar` - Upload user avatar
   - `POST /api/upload/deliverable` - Upload project file
   - `POST /api/upload/kyc` - Upload KYC document
   - `POST /api/upload/course` - Upload course media

4. **Update Frontend Components**
   - Add file upload UI
   - Handle multipart/form-data
   - Show upload progress

5. **Migrate Existing Files**
   - Script to upload existing file URLs to R2
   - Update database records with new R2 URLs

---

## Current Status

✅ **Step 1 Complete:** Admin role and routes implemented
⏳ **Step 2 Pending:** D1 migration
⏳ **Step 3 Pending:** R2 storage

## Next Actions

1. Test admin functionality locally
2. Create admin UI page in Next.js app
3. Proceed with D1 migration when ready
4. Implement R2 storage for file uploads

## Notes

- All admin routes require authentication with `role: 'admin'`
- Database schema is already D1-compatible (SQLite)
- File storage currently uses URL strings (ready for R2 migration)
- Consider adding admin user management UI
- Add audit logging for admin actions
