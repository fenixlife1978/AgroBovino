import { requireSession } from '../_lib/auth.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const session = await requireSession(req, res);
  if (!session) return;
  return res.status(200).json({
    authenticated: true,
    user: { username: session.username, role: session.role },
  });
}