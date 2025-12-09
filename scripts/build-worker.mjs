import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routePath = path.join(__dirname, '..', 'src', 'app', 'api', '[[...route]]', 'route.ts');
const workerPath = path.join(__dirname, '..', 'worker', 'index.ts');

// Read the route file
let routeContent = fs.readFileSync(routePath, 'utf8');

// Extract everything between middleware setup and export statements
const startMarker = '// ============ AUTH ROUTES ============';
const endMarker = '// ============ ADMIN MIDDLEWARE ============';

const startIndex = routeContent.indexOf(startMarker);
let endIndex = routeContent.indexOf(endMarker);

// If no admin middleware marker, use export marker
if (endIndex === -1) {
  endIndex = routeContent.indexOf('export const GET = handle(app);');
}

if (startIndex === -1 || endIndex === -1) {
  console.error('❌ Could not find route markers');
  process.exit(1);
}

let routes = routeContent.substring(startIndex, endIndex).trim();

// Ensure all route handlers are async
routes = routes.replace(/app\.(get|post|patch|delete)\('([^']+)',\s*adminOnly,\s*\(c\)/g, 
  'app.$1(\'$2\', adminOnly, async (c)');

routes = routes.replace(/app\.(get|post|patch|delete)\('([^']+)',\s*\(c\)/g, 
  (match, method, path) => {
    if (!match.includes('async')) {
      return `app.${method}('${path}', async (c)`;
    }
    return match;
  }
);

// Read worker template
let workerContent = fs.readFileSync(workerPath, 'utf8');

// Remove the simple health check and add all routes
workerContent = workerContent.replace(
  `// Health check
app.get('/', (c) => c.json({ 
  message: 'FreelanceMatch API', 
  version: '1.0.0',
  status: 'healthy'
}));`,
  routes
);

// Write the complete worker
fs.writeFileSync(workerPath, workerContent);

console.log('✅ Worker built successfully');
console.log('📦 Routes extracted and added to worker/index.ts');

