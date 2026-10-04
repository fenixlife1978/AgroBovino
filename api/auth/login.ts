import { createSession, setSessionCookie, authenticateUser } from '../_lib/auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });

  try {
    const user = await authenticateUser(username, password);
    if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    setSessionCookie(res, createSession(user.username, user.role));
    return res.status(200).json({ authenticated: true, user });
  } catch (error) {
    console.error('AgroBovino login error:', error);
    return res.status(500).json({ error: 'No se pudo completar la autenticación.' });
  }
}
