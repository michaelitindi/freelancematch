import Cookies from 'js-cookie';

const COOKIE_NAME = 'fm_session';

// Client-side cookie management
export function setAuthCookie(token: string) {
  Cookies.set(COOKIE_NAME, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export function getAuthCookie(): string | undefined {
  return Cookies.get(COOKIE_NAME);
}

export function removeAuthCookie() {
  Cookies.remove(COOKIE_NAME);
}

// Parse JWT payload without verification (for client-side display only)
export function parseToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

// Check if user is authenticated (client-side)
export function isAuthenticated(): boolean {
  const token = getAuthCookie();
  if (!token) return false;
  
  const payload = parseToken(token);
  if (!payload) return false;
  
  // Check if token is expired
  try {
    const base64Payload = token.split('.')[1];
    const decoded = JSON.parse(atob(base64Payload));
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      removeAuthCookie();
      return false;
    }
  } catch {
    return false;
  }
  
  return true;
}

// Get current user from token (client-side)
export function getCurrentUser(): { userId: string; email: string; role: string } | null {
  const token = getAuthCookie();
  if (!token) return null;
  return parseToken(token);
}
