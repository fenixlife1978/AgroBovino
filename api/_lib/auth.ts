import { createHmac, timingSafeEqual, randomBytes, scryptSync } from 'node:crypto';
import { createClient } from '@libsql/client';

export type UserRole = 'admin' | 'vaquero';

type SessionPayload = {
  username: string;
  role: UserRole;
  exp: number;
};

export type ManagedUser = {
  username: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

const COOKIE_NAME = 'agrobovino_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET debe existir y tener al menos 32 caracteres.');
  return value;
}

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error('Variables TURSO_DATABASE_URL/TURSO_AUTH_TOKEN incompletas.');
  return createClient({ url, authToken });
}

export function encode(value: string): string { return Buffer.from(value, 'utf8').toString('base64url'); }
export function decode(value: string): string { return Buffer.from(value, 'base64url').toString('utf8'); }
function sign(value: string): string { return createHmac('sha256', secret()).update(value).digest('base64url'); }

export function createSession(username: string, role: UserRole): string {
  const payload: SessionPayload = { username, role, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
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
    if (!payload.username || (payload.role !== 'admin' && payload.role !== 'vaquero') || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

export function setSessionCookie(res: any, token: string): void {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`);
}
export function clearSessionCookie(res: any): void {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}
export function requireSession(req: any, res: any): SessionPayload | null {
  const session = getSession(req);
  if (!session) { res.status(401).json({ error: 'No autenticado', code: 'UNAUTHORIZED' }); return null; }
  return session;
}
export function requireAdmin(req: any, res: any): SessionPayload | null {
  const session = requireSession(req, res);
  if (!session) return null;
  if (session.role !== 'admin') { res.status(403).json({ error: 'Se requiere rol de administrador.', code: 'FORBIDDEN' }); return null; }
  return session;
}

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')): string {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, digest] = stored.split(':');
  if (!salt || !digest) return false;
  const expected = scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(digest, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function ensureSeedAdmin(): Promise<void> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('ADMIN_PASSWORD no está configurada.');
  const db = getDb();
  await db.execute(`CREATE TABLE IF NOT EXISTS app_users (
    username TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    password TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  )`);
  const existing = await db.execute({ sql: 'SELECT username FROM app_users WHERE username = ? LIMIT 1', args: ['admin'] });
  if (!existing.rows.length) {
    await db.execute({
      sql: 'INSERT INTO app_users (username, role, password, active, created_at) VALUES (?, ?, ?, 1, ?)',
      args: ['admin', 'admin', hashPassword(password), new Date().toISOString()],
    });
  }
}

export async function authenticateUser(username: string, password: string): Promise<{ username: string; role: UserRole } | null> {
  const db = getDb();
  await ensureSeedAdmin();
  const result = await db.execute({
    sql: 'SELECT username, role, password FROM app_users WHERE username = ? AND active = 1 LIMIT 1',
    args: [username],
  });
  const row = result.rows[0] as { username?: string; role?: string; password?: string } | undefined;
  if (!row?.username || (row.role !== 'admin' && row.role !== 'vaquero') || !row.password || !verifyPassword(password, row.password)) return null;
  return { username: row.username, role: row.role as UserRole };
}

export async function listUsers(): Promise<ManagedUser[]> {
  const db = getDb();
  await ensureSeedAdmin();
  const result = await db.execute('SELECT username, role, active, created_at FROM app_users ORDER BY role ASC, username ASC');
  return result.rows.map((row: any) => ({
    username: String(row.username),
    role: row.role === 'admin' ? 'admin' : 'vaquero',
    active: Number(row.active) === 1,
    createdAt: String(row.created_at),
  }));
}

export async function createUser(username: string, password: string, role: UserRole): Promise<void> {
  const db = getDb();
  await ensureSeedAdmin();
  await db.execute({
    sql: 'INSERT INTO app_users (username, role, password, active, created_at) VALUES (?, ?, ?, 1, ?)',
    args: [username, role, hashPassword(password), new Date().toISOString()],
  });
}

export async function setUserActive(username: string, active: boolean): Promise<void> {
  const db = getDb();
  await db.execute({ sql: 'UPDATE app_users SET active = ? WHERE username = ?', args: [active ? 1 : 0, username] });
}

export async function updateUserPassword(username: string, password: string): Promise<void> {
  const db = getDb();
  await db.execute({ sql: 'UPDATE app_users SET password = ? WHERE username = ?', args: [hashPassword(password), username] });
}

export async function deleteUser(username: string): Promise<void> {
  const db = getDb();
  const target = await db.execute({ sql: 'SELECT username, role FROM app_users WHERE username = ? LIMIT 1', args: [username] });
  const row = target.rows[0] as { username?: string; role?: string } | undefined;
  if (!row?.username) throw new Error('El usuario no existe.');

  if (row.role === 'admin') {
    const admins = await db.execute({ sql: "SELECT COUNT(*) AS total FROM app_users WHERE role = 'admin' AND active = 1", args: [] });
    const total = Number((admins.rows[0] as any)?.total || 0);
    if (total <= 1) throw new Error('No se puede eliminar al último administrador.');
  }

  await db.execute({ sql: 'DELETE FROM app_users WHERE username = ?', args: [username] });
}
