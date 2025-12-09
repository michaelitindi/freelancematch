import { Hono } from 'hono';
import { generateId } from '../src/lib/db-wrapper';

type Bindings = {
  DB: D1Database;
  FILES: R2Bucket;
};

const upload = new Hono<{ Bindings: Bindings }>();

// Upload avatar
upload.post('/avatar', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }

  const key = `avatars/${Date.now()}-${file.name}`;
  await c.env.FILES.put(key, file);
  
  return c.json({ key, url: `/files/${key}` });
});

// Upload deliverable
upload.post('/deliverable', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  const projectId = formData.get('projectId') as string;
  
  if (!file || !projectId) {
    return c.json({ error: 'File and projectId required' }, 400);
  }

  const key = `deliverables/${projectId}/${Date.now()}-${file.name}`;
  await c.env.FILES.put(key, file);
  
  return c.json({ key, url: `/files/${key}`, size: file.size, type: file.type });
});

// Upload KYC document
upload.post('/kyc', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;
  const documentType = formData.get('documentType') as string;
  
  if (!file || !userId || !documentType) {
    return c.json({ error: 'File, userId, and documentType required' }, 400);
  }

  const key = `kyc/${userId}/${documentType}-${Date.now()}-${file.name}`;
  await c.env.FILES.put(key, file);
  
  return c.json({ key, url: `/files/${key}` });
});

// Upload course media
upload.post('/course', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  const courseId = formData.get('courseId') as string;
  
  if (!file || !courseId) {
    return c.json({ error: 'File and courseId required' }, 400);
  }

  const key = `courses/${courseId}/${Date.now()}-${file.name}`;
  await c.env.FILES.put(key, file);
  
  return c.json({ key, url: `/files/${key}` });
});

// Get file
upload.get('/:key{.+}', async (c) => {
  const key = c.req.param('key');
  const object = await c.env.FILES.get(key);
  
  if (!object) {
    return c.json({ error: 'File not found' }, 404);
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
});

// Delete file
upload.delete('/:key{.+}', async (c) => {
  const key = c.req.param('key');
  await c.env.FILES.delete(key);
  return c.json({ success: true });
});

export default upload;
