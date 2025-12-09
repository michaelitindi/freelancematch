# Step 2: Cloudflare D1 Migration - Preparation Guide

## Prerequisites

### 1. Cloudflare Account Setup
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 2. Create D1 Database
```bash
# Create database
wrangler d1 create freelancematch-db

# Save the output - you'll need the database_id
```

### 3. Export Current Data
```bash
# Export schema and data
sqlite3 freelancematch.db .dump > migration.sql

# Verify export
wc -l migration.sql
```

## Configuration Files to Create

### 1. wrangler.toml
```toml
name = "freelancematch"
compatibility_date = "2024-12-09"
pages_build_output_dir = ".vercel/output/static"

[[d1_databases]]
binding = "DB"
database_name = "freelancematch-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 2. Update package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "deploy": "wrangler pages deploy",
    "d1:migrate": "wrangler d1 execute freelancematch-db --file=migration.sql"
  }
}
```

## Code Changes Required

### 1. Database Client (src/lib/db.ts)

**Before (SQLite):**
```typescript
import Database from 'better-sqlite3';
const db = new Database('freelancematch.db');
const users = db.prepare('SELECT * FROM users').all();
```

**After (D1):**
```typescript
export async function getDB(env: any) {
  return env.DB;
}

// Usage
const users = await env.DB.prepare('SELECT * FROM users').all();
```

### 2. API Routes Pattern

**Before:**
```typescript
app.get('/users', (c) => {
  const users = db.prepare('SELECT * FROM users').all();
  return c.json(users);
});
```

**After:**
```typescript
app.get('/users', async (c) => {
  const users = await c.env.DB.prepare('SELECT * FROM users').all();
  return c.json(users.results);
});
```

### 3. Hono Context Type

**Add D1 binding:**
```typescript
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ 
  Variables: Variables;
  Bindings: Bindings;
}>().basePath('/api');
```

## Migration Checklist

- [ ] Install Wrangler CLI
- [ ] Create Cloudflare account
- [ ] Create D1 database
- [ ] Export SQLite data
- [ ] Create wrangler.toml
- [ ] Update database client to async
- [ ] Update all API routes to async
- [ ] Add D1 types
- [ ] Test locally with Wrangler
- [ ] Import data to D1
- [ ] Deploy to Cloudflare Pages
- [ ] Update environment variables
- [ ] Test production deployment

## Local Development with D1

```bash
# Run local D1 instance
wrangler pages dev --d1 DB=freelancematch-db

# Or with Next.js
wrangler pages dev npm run dev
```

## Import Data to D1

```bash
# Import schema and data
wrangler d1 execute freelancematch-db --file=migration.sql

# Verify import
wrangler d1 execute freelancematch-db --command="SELECT COUNT(*) FROM users"
```

## Key Differences: SQLite vs D1

| Feature | SQLite (better-sqlite3) | Cloudflare D1 |
|---------|------------------------|---------------|
| API | Synchronous | Async (Promise-based) |
| Results | Direct array | `{ results: [] }` object |
| Transactions | `db.transaction()` | `db.batch()` |
| Location | Local file | Distributed edge |
| Scaling | Single instance | Global replication |

## Common Pitfalls

1. **Forgetting async/await**
   - All D1 operations are async
   - Add `async` to route handlers
   - Use `await` for all DB calls

2. **Result format**
   - D1 returns `{ results: [], success: true }`
   - Access data via `.results` property

3. **Transactions**
   - Use `db.batch([])` instead of `db.transaction()`
   - Batch operations for better performance

4. **Environment binding**
   - Access via `c.env.DB` not global `db`
   - Pass env through context

## Testing Strategy

1. **Local Testing**
   - Use Wrangler dev mode
   - Test with local D1 instance

2. **Staging**
   - Create separate D1 database for staging
   - Test full deployment flow

3. **Production**
   - Backup SQLite data
   - Import to production D1
   - Monitor for errors

## Rollback Plan

If issues occur:
1. Keep SQLite database as backup
2. Switch back to better-sqlite3
3. Restore from backup
4. Debug D1 issues offline

## Estimated Time

- Setup: 30 minutes
- Code changes: 2-3 hours
- Testing: 1-2 hours
- Deployment: 30 minutes

**Total: 4-6 hours**

## Ready to Start?

When ready to begin Step 2, run:
```bash
npm install -g wrangler
wrangler login
wrangler d1 create freelancematch-db
```

Then follow the migration steps in `MIGRATION_GUIDE.md`.
