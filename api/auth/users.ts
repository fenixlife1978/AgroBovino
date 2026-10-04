import { createUser, deleteUser, listUsers, requireAdmin, setUserActive, updateUserPassword, type UserRole } from '../_lib/auth';

function validRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'vaquero';
}

function validUsername(value: string): boolean {
  return /^[a-z0-9._-]{3,40}$/.test(value);
}

export default async function handler(req: any, res: any) {
  if (!requireAdmin(req, res)) return;
  try {
    if (req.method === 'GET') return res.status(200).json({ users: await listUsers() });

    const username = String(req.body?.username || '').trim().toLowerCase();
    if (!validUsername(username)) return res.status(400).json({ error: 'Usuario inválido. Usa 3-40 caracteres: letras, números, punto, guion o guion bajo.' });

    if (req.method === 'POST') {
      const password = String(req.body?.password || '');
      const role = req.body?.role;
      if (!validRole(role)) return res.status(400).json({ error: 'Rol inválido.' });
      if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
      await createUser(username, password, role);
      return res.status(201).json({ users: await listUsers() });
    }

    if (req.method === 'PATCH') {
      if (req.body?.active === false) {
        const current = await listUsers();
        const target = current.find(user => user.username === username);
        if (target?.role === 'admin' && current.filter(user => user.role === 'admin' && user.active).length <= 1) return res.status(400).json({ error: 'No se puede desactivar al último administrador.' });
      }
      if (typeof req.body?.active === 'boolean') await setUserActive(username, req.body.active);
      if (req.body?.password !== undefined) {
        const password = String(req.body.password);
        if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
        await updateUserPassword(username, password);
      }
      return res.status(200).json({ users: await listUsers() });
    }

    if (req.method === 'DELETE') {
      await deleteUser(username);
      return res.status(200).json({ users: await listUsers() });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    const message = String(error?.message || '');
    if (message.includes('UNIQUE constraint failed')) return res.status(409).json({ error: 'Ese usuario ya existe.' });
    if (message.includes('no se puede eliminar') || message.includes('Crea otro administrador')) return res.status(400).json({ error: message });
    console.error('AgroBovino users error:', error);
    return res.status(500).json({ error: 'No se pudo actualizar los usuarios.' });
  }
}
