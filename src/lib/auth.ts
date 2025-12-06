import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Secret key for JWT - in production, use a proper secret from env
const JWT_SECRET = process.env.JWT_SECRET || 'freelancematch-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d'; // 7 days
const COOKIE_NAME = 'fm_session';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Hash password (simple bcrypt-like hash for demo - use bcrypt in production)
export function hashPassword(password: string): string {
  // Simple hash for demo - in production use bcrypt
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Cookie options
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  path: '/',
};

// Get session from cookies (server-side)
export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  return verifyToken(token);
}

// Cookie name export for client use
export { COOKIE_NAME };
