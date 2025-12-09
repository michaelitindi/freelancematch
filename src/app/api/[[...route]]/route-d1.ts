import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { generateId, jsonParse } from '@/lib/db-d1';
import { Polar } from '@polar-sh/sdk';
import { generateToken, verifyToken, hashPassword, verifyPassword } from '@/lib/auth';

type Variables = {
  user: { userId: string; email: string; role: string } | null;
};

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Variables: Variables; Bindings: Bindings }>().basePath('/api');

app.use('*', cors({ origin: '*', credentials: true }));

const polar = process.env.POLAR_ACCESS_TOKEN 
  ? new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN })
  : null;

const COOKIE_NAME = 'fm_session';

async function authMiddleware(c: any, next: () => Promise<void>) {
  const token = getCookie(c, COOKIE_NAME);
  if (token) {
    const payload = verifyToken(token);
    if (payload) c.set('user', payload);
  }
  await next();
}

app.use('*', authMiddleware);

async function adminOnly(c: any, next: () => Promise<void>) {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
}

// Helper to get first result
const first = (result: any) => result.results?.[0] || null;
const all = (result: any) => result.results || [];

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
