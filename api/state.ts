import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client';

const TABLE_SQL = `CREATE TABLE IF NOT EXISTS app_state (
  state_key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

function client() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error('Turso server environment variables are not configured.');
  return createClient({ url, authToken });
}

function normalizeKey(value: unknown): string {
  const key = String(value || 'default').trim();
  return key.slice(0, 120) || 'default';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = client();
    await db.execute(TABLE_SQL);
    const key = normalizeKey(req.method === 'GET' ? req.query.farmId : req.body?.farmId);

    if (req.method === 'GET') {
      const result = await db.execute({ sql: 'SELECT payload, updated_at FROM app_state WHERE state_key = ?', args: [key] });
      if (!result.rows.length) return res.status(404).json({ found: false });
      const row = result.rows[0] as { payload: string; updated_at: string };
      return res.status(200).json({ found: true, state: JSON.parse(row.payload), updatedAt: row.updated_at });
    }

    const state = req.body?.state;
    if (!state || typeof state !== 'object') return res.status(400).json({ error: 'Invalid state payload' });
    const serialized = JSON.stringify(state);
    if (serialized.length > 5_000_000) return res.status(413).json({ error: 'State payload too large' });
    const updatedAt = new Date().toISOString();
    await db.execute({
      sql: 'INSERT INTO app_state (state_key, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(state_key) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at',
      args: [key, serialized, updatedAt],
    });
    return res.status(200).json({ saved: true, updatedAt });
  } catch (error) {
    console.error('Turso state API error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
}
