import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routePath = path.join(__dirname, '..', 'src', 'app', 'api', '[[...route]]', 'route.ts');

let content = fs.readFileSync(routePath, 'utf8');

// Backup original
fs.writeFileSync(routePath + '.backup', content);

// Replace imports
content = content.replace(
  "import db, { generateId, jsonParse } from '@/lib/db';",
  "import { generateId, jsonParse } from '@/lib/db-d1';"
);

// Update type definitions
content = content.replace(
  'type Variables = {\n  user: { userId: string; email: string; role: string } | null;\n};',
  `type Variables = {
  user: { userId: string; email: string; role: string } | null;
};

type Bindings = {
  DB: D1Database;
};`
);

// Update Hono app initialization
content = content.replace(
  "const app = new Hono<{ Variables: Variables }>().basePath('/api');",
  "const app = new Hono<{ Variables: Variables; Bindings: Bindings }>().basePath('/api');"
);

// Add helper functions after middleware
const helpersInsert = `
// Helper to get first result
const first = (result: any) => result.results?.[0] || null;
const all = (result: any) => result.results || [];
`;

content = content.replace(
  '// Apply auth middleware to all routes\napp.use(\'*\', authMiddleware);',
  `// Apply auth middleware to all routes
app.use('*', authMiddleware);
${helpersInsert}`
);

// Convert db.prepare().run() to await c.env.DB.prepare().run()
content = content.replace(/db\.prepare\(/g, 'await c.env.DB.prepare(');

// Convert .get() to first()
content = content.replace(/\.get\(([^)]*)\) as any/g, (match, params) => {
  return params ? `.bind(${params}).first()` : '.first()';
});
content = content.replace(/\.get\(([^)]*)\);/g, (match, params) => {
  return params ? `.bind(${params}).first();` : '.first();';
});

// Convert .all() to all()
content = content.replace(/\.all\(([^)]*)\);/g, (match, params) => {
  return params ? `.bind(${params}).all().then(all);` : '.all().then(all);';
});
content = content.replace(/\.all\(([^)]*)\) as any/g, (match, params) => {
  return params ? `.bind(${params}).all().then(all)` : '.all().then(all)';
});

// Make all route handlers async if not already
content = content.replace(/app\.(get|post|patch|delete)\('([^']+)',\s*(?!async)\(/g, 'app.$1(\'$2\', async (');

// Write converted file
fs.writeFileSync(routePath, content);

console.log('✅ Converted route.ts to D1 format');
console.log('📦 Backup saved as route.ts.backup');
console.log('⚠️  Manual review required - check for complex queries');
