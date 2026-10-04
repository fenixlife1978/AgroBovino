import { createClient } from '@libsql/client';
import { clearSessionCookie, ensureSeedAdmin, requireAdmin } from '../_lib/auth';

function client() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error('Variables TURSO_DATABASE_URL/TURSO_AUTH_TOKEN incompletas.');
  return createClient({ url, authToken });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const db = client();
    await db.execute('DROP TABLE IF EXISTS app_state');
    await db.execute('DROP TABLE IF EXISTS app_users');
    await db.execute('DROP TABLE IF EXISTS app_settings');
    await ensureSeedAdmin();
    clearSessionCookie(res);
    return res.status(200).json({ reset: true, message: 'Reinicio de fábrica completado. El administrador semilla fue restaurado.' });
  } catch (error) {
    console.error('Factory reset error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'No se pudo completar el reinicio de fábrica.' });
  }
}
