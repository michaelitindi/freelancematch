import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routePath = path.join(__dirname, '..', 'src', 'app', 'api', '[[...route]]', 'route.ts');

// Restore from backup
const backupPath = routePath + '.sqlite-backup';
let content = fs.readFileSync(backupPath, 'utf8');

// Update imports (already done, but ensure it's correct)
content = content.replace(
  "import db, { generateId, jsonParse } from '@/lib/db';",
  "import { createDBWrapper, generateId, jsonParse } from '@/lib/db-wrapper';"
);

// Update types (already done)
content = content.replace(
  'type Variables = {\n  user: { userId: string; email: string; role: string } | null;\n};',
  `type Variables = {
  user: { userId: string; email: string; role: string } | null;
  db: ReturnType<typeof createDBWrapper>;
};

type Bindings = {
  DB: D1Database;
};`
);

// Update Hono initialization
content = content.replace(
  "const app = new Hono<{ Variables: Variables }>().basePath('/api');",
  "const app = new Hono<{ Variables: Variables; Bindings: Bindings }>().basePath('/api');"
);

// Update middleware section
content = content.replace(
  `const COOKIE_NAME = 'fm_session';

// Auth middleware
async function authMiddleware(c: any, next: () => Promise<void>) {
  const token = getCookie(c, COOKIE_NAME);
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      c.set('user', payload);
    }
  }
  
  await next();
}

// Apply auth middleware to all routes
app.use('*', authMiddleware);`,
  `const COOKIE_NAME = 'fm_session';

// DB middleware
async function dbMiddleware(c: any, next: () => Promise<void>) {
  c.set('db', createDBWrapper(c.env.DB));
  await next();
}

// Auth middleware
async function authMiddleware(c: any, next: () => Promise<void>) {
  const token = getCookie(c, COOKIE_NAME);
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      c.set('user', payload);
    }
  }
  
  await next();
}

// Apply middleware
app.use('*', dbMiddleware);
app.use('*', authMiddleware);`
);

// Now convert all route handlers
// Match route handlers and add db declaration
content = content.replace(
  /app\.(get|post|patch|delete)\('([^']+)',\s*(async\s*)?\(c[^)]*\)\s*=>\s*\{/g,
  (match, method, path, asyncKeyword) => {
    return `app.${method}('${path}', async (c) => {\n  const db = c.get('db');`;
  }
);

// Add await to all db operations
content = content.replace(/(\s+)(db\.prepare\([^;]+;)/g, (match, space, dbCall) => {
  if (match.includes('await')) return match;
  return space + 'await ' + dbCall;
});

// Clean up double awaits
content = content.replace(/await\s+await/g, 'await');

fs.writeFileSync(routePath, content);

console.log('✅ D1 conversion complete');
console.log('⚠️  Please test all endpoints');

