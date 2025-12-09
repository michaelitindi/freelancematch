#!/bin/bash

echo "🧹 Cleaning up local-only files..."

# Backup first (just in case)
mkdir -p .backups
cp freelancematch.db .backups/freelancematch.db.backup 2>/dev/null || true
cp src/lib/db.ts .backups/db.ts.backup 2>/dev/null || true

# Remove local SQLite database
echo "📦 Removing local SQLite database..."
rm -f freelancematch.db
rm -f freelancematch.db-shm
rm -f freelancematch.db-wal

# Remove old database client (keep as reference)
echo "📝 Archiving old database client..."
mv src/lib/db.ts .backups/db.ts.old 2>/dev/null || true

# Remove mock data (if not needed)
echo "🗑️  Removing mock data..."
rm -f src/lib/mock-data.ts 2>/dev/null || true
rm -f src/lib/seed-db.ts 2>/dev/null || true

# Remove old route backup
echo "🗂️  Cleaning up route backups..."
rm -f src/app/api/[[...route]]/route.ts.sqlite-backup 2>/dev/null || true

# Remove worker build artifacts
echo "🔧 Cleaning worker artifacts..."
rm -f worker/routes.ts 2>/dev/null || true

# Remove test files
echo "🧪 Removing test files..."
rm -f test-avatar.txt 2>/dev/null || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Removed:"
echo "  - freelancematch.db (local SQLite)"
echo "  - src/lib/db.ts (old client)"
echo "  - src/lib/mock-data.ts"
echo "  - src/lib/seed-db.ts"
echo "  - Test files"
echo ""
echo "Backups saved in .backups/ directory"
echo ""
echo "⚠️  Note: You can still rollback using backups if needed"
