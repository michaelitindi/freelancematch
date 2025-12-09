import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routePath = path.join(__dirname, '..', 'src', 'app', 'api', '[[...route]]', 'route.ts');

let content = fs.readFileSync(routePath, 'utf8');

// Update deliverable creation to note that fileUrl should be R2 key
const deliverableComment = `
  // Note: fileUrl should be the R2 key from /upload/deliverable endpoint
  // Example: deliverables/project-id/timestamp-filename.ext
`;

content = content.replace(
  'app.post(\'/deliverables\', async (c) => {',
  `app.post('/deliverables', async (c) => {${deliverableComment}`
);

// Update KYC document upload to note R2 usage
const kycComment = `
  // Note: fileUrl should be the R2 key from /upload/kyc endpoint
  // Example: kyc/user-id/document-type-timestamp-filename.ext
`;

content = content.replace(
  'app.post(\'/kyc/documents\', async (c) => {',
  `app.post('/kyc/documents', async (c) => {${kycComment}`
);

fs.writeFileSync(routePath, content);

console.log('✅ Routes updated with R2 comments');
console.log('📝 File URLs now reference R2 keys');
