import { createHmac, timingSafeEqual } from 'node:crypto';

export type UserRole = 'admin' | 'vaquero';

type SessionPayload = {
  role: UserRole;
  exp: number;
};

const COOKIE_NAME = 'agrobovino_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error('SESSION_SECRET debe existir y tener al menos 32 caracteres.');
  }
  return value;
}

function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createSession(role: UserRole): string {
  const payload: SessionPayload = { role, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const encoded = encode(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function getSession(req: any): SessionPayload | null {
  try {
    const header = String(req.headers?.cookie || '');
    const pair = header.split(';').map((part: string) => part.trim()).find((part: string) => part.startsWith(`${COOKIE_NAME}=`));
    if (!pair) return null;

    const token = pair.slice(COOKIE_NAME.length + 1);
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) return null;

    const expected = sign(encoded);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(decode(encoded)) as SessionPayload;
    if ((payload.role !== 'admin' && payload.role !== 'vaquero') || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: any, token: string): void {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`);
}

export function clearSessionCookie(res: any): void {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

export function requireSession(req: any, res: any): SessionPayload | null {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'No autenticado', code: 'UNAUTHORIZED' });
    return null;
  }
  return session;
}
