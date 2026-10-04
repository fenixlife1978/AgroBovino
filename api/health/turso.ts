import { createClient } from '@libsql/client';
import { requireSession } from '../_lib/auth.js';

export default async function handler(req: any, res: any) {
  if (!requireSession(req, res)) return;
  try {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url || !authToken) return res.status(503).json({ ok: false, error: 'Turso environment variables are not configured.' });
    const db = createClient({ url, authToken });
    const started = Date.now();
    await db.execute('SELECT 1');
    return res.status(200).json({ ok: true, latencyMs: Date.now() - started });
  } catch (error) {
    console.error('Turso health check failed:', error);
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'Turso connection failed' });
  }
}
