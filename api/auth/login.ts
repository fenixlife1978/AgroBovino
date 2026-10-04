import { createSession, setSessionCookie, ensureSeedAdmin, verifyPassword, type UserRole } from '../_lib/auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await ensureSeedAdmin();
  } catch (error) {
    console.error('AgroBovino seed admin error:', error);
    return res.status(500).json({ error: 'No se pudo inicializar el administrador semilla.' });
  }

  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  const credentials: Record<string, { role: UserRole; password?: string }> = {
    admin: { role: 'admin', password: process.env.ADMIN_PASSWORD },
    vaquero: { role: 'vaquero', password: process.env.VAQUERO_PASSWORD },
  };

  const account = credentials[username];
  if (!account?.password || password !== account.password) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }

  try {
    setSessionCookie(res, createSession(account.role));
    return res.status(200).json({
      authenticated: true,
      user: { username, role: account.role },
    });
  } catch (error) {
    console.error('AgroBovino login error:', error);
    return res.status(500).json({ error: 'La autenticación no está configurada correctamente en el servidor.' });
  }
}
