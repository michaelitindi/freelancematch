# Cloudflare D1 Setup Instructions

## Step 1: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window for authentication.

## Step 2: Create D1 Database

```bash
wrangler d1 create freelancematch-db
```

**Important:** Copy the `database_id` from the output!

Example output:
```
✅ Successfully created DB 'freelancematch-db'!

[[d1_databases]]
binding = "DB"
database_name = "freelancematch-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## Step 3: Update wrangler.toml

Edit `wrangler.toml` and replace `YOUR_DATABASE_ID_HERE` with your actual database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "freelancematch-db"
database_id = "your-actual-database-id-here"
```

## Step 4: Import Data to D1

```bash
wrangler d1 execute freelancematch-db --file=migration.sql
```

This will import your existing SQLite data into D1.

## Step 5: Verify Import

```bash
wrangler d1 execute freelancematch-db --command="SELECT COUNT(*) as count FROM users"
```

You should see your user count.

## Step 6: Test Locally with D1

```bash
npm run dev:wrangler
```

This runs Next.js with Wrangler's local D1 instance.

## Step 7: Deploy to Cloudflare Pages

First, build your app:
```bash
npm run build
```

Then deploy:
```bash
wrangler pages deploy
```

Or use the combined command:
```bash
npm run deploy
```

## Troubleshooting

### Issue: "wrangler: command not found"
```bash
npm install -g wrangler
```

### Issue: Database not found
Make sure you've updated `wrangler.toml` with the correct `database_id`.

### Issue: Import fails
Check `migration.sql` for syntax errors. D1 uses SQLite syntax.

### Issue: Local dev not working
Make sure you're using `npm run dev:wrangler` instead of `npm run dev`.

## Environment Variables

If you have environment variables (like POLAR_ACCESS_TOKEN), add them to Cloudflare Pages:

1. Go to Cloudflare Dashboard
2. Select your Pages project
3. Go to Settings > Environment variables
4. Add your variables

## Useful Commands

```bash
# List all D1 databases
wrangler d1 list

# Execute a query
wrangler d1 execute freelancematch-db --command="SELECT * FROM users LIMIT 5"

# Delete database (careful!)
wrangler d1 delete freelancematch-db

# View logs
wrangler pages deployment tail
```

## Next Steps

After D1 is working:
1. Test all API endpoints
2. Verify admin functionality
3. Proceed to Step 3: R2 Storage migration
