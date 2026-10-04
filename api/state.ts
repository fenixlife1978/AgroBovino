import { createClient } from '@libsql/client';

const TABLE_SQL = `CREATE TABLE IF NOT EXISTS app_state (
  state_key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
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

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = client();
    await db.execute(TABLE_SQL);
    const key = normalizeKey(req.method === 'GET' ? req.query.farmId : req.body?.farmId);

    if (req.method === 'GET') {
      const result = await db.execute({ sql: 'SELECT payload, updated_at, version FROM app_state WHERE state_key = ?', args: [key] });
      if (!result.rows.length) return res.status(404).json({ found: false });
      const row = result.rows[0] as { payload: string; updated_at: string; version: number };
      return res.status(200).json({ found: true, state: JSON.parse(row.payload), updatedAt: row.updated_at, version: Number(row.version) });
    }

    const state = req.body?.state;
    if (!state || typeof state !== 'object') return res.status(400).json({ error: 'Invalid state payload' });
    const serialized = JSON.stringify(state);
    if (serialized.length > 5_000_000) return res.status(413).json({ error: 'State payload too large' });
    const expectedVersion = req.body?.version == null ? null : Number(req.body.version);
    if (expectedVersion !== null && (!Number.isInteger(expectedVersion) || expectedVersion < 0)) return res.status(400).json({ error: 'Invalid version' });
    const updatedAt = new Date().toISOString();
    if (expectedVersion === null) {
      await db.execute({ sql: 'INSERT INTO app_state (state_key, payload, updated_at, version) VALUES (?, ?, ?, 1) ON CONFLICT(state_key) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at, version=app_state.version+1', args: [key, serialized, updatedAt] });
    } else {
      const result = await db.execute({ sql: 'UPDATE app_state SET payload = ?, updated_at = ?, version = version + 1 WHERE state_key = ? AND version = ?', args: [serialized, updatedAt, key, expectedVersion] });
      if (!result.rowsAffected) return res.status(409).json({ error: 'State version conflict', code: 'VERSION_CONFLICT' });
    }
    const current = await db.execute({ sql: 'SELECT version FROM app_state WHERE state_key = ?', args: [key] });
    const version = Number((current.rows[0] as { version: number }).version);
    return res.status(200).json({ saved: true, updatedAt, version });
  } catch (error) {
    console.error('Turso state API error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
}
