import React, { useEffect, useState } from 'react';
import { KeyRound, Plus, ShieldCheck, UserCheck, UserX, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';

type ManagedUser = { username: string; role: 'admin' | 'vaquero'; active: boolean; createdAt: string };

export const UserManagementModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'vaquero'>('vaquero');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/auth/users', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'No se pudieron cargar los usuarios.');
      setUsers(data.users || []);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { if (isOpen) void load(); }, [isOpen]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, role }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'No se pudo crear el usuario.');
      setUsers(data.users || []); setUsername(''); setPassword(''); setRole('vaquero');
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const toggle = async (user: ManagedUser) => {
    setError(''); setLoading(true);
    try {
      const response = await fetch('/api/auth/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user.username, active: !user.active }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'No se pudo cambiar el estado.');
      setUsers(data.users || []);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const resetPassword = async (user: ManagedUser) => {
    const next = window.prompt(`Nueva contraseña para ${user.username} (mínimo 8 caracteres):`);
    if (!next) return;
    setError(''); setLoading(true);
    try {
      const response = await fetch('/api/auth/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user.username, password: next }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'No se pudo cambiar la contraseña.');
      setUsers(data.users || []);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const remove = async (user: ManagedUser) => {
    if (!window.confirm(user.username === 'admin' ? '¿Eliminar el administrador semilla? Volverá a aparecer al realizar un reinicio de fábrica del sistema, siempre que ADMIN_PASSWORD esté configurada.' : `¿Eliminar al usuario ${user.username}?`)) return;
    setError(''); setLoading(true);
    try {
      const response = await fetch('/api/auth/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user.username }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'No se pudo eliminar el usuario.');
      setUsers(data.users || []);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Usuarios y accesos" subtitle="El administrador crea y administra los accesos de la finca." maxWidth="3xl">
      <div className="space-y-6">
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div><label className="text-xs font-bold text-slate-600">Usuario</label><input value={username} onChange={e => setUsername(e.target.value.toLowerCase())} placeholder="ej. juan" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" required /></div>
          <div><label className="text-xs font-bold text-slate-600">Contraseña</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mín. 8 caracteres" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" required minLength={8} /></div>
          <div><label className="text-xs font-bold text-slate-600">Rol</label><select value={role} onChange={e => setRole(e.target.value as 'admin' | 'vaquero')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="vaquero">Vaquero</option><option value="admin">Administrador</option></select></div>
          <button disabled={loading} className="self-end inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2.5 text-sm font-bold disabled:opacity-50"><Plus className="w-4 h-4" />Crear usuario</button>
        </form>

        {error && <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">{error}</div>}

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase"><tr><th className="text-left p-3">Usuario</th><th className="text-left p-3">Rol</th><th className="text-left p-3">Estado</th><th className="text-right p-3">Acciones</th></tr></thead>
            <tbody>
              {users.map(user => <tr key={user.username} className="border-t border-slate-100">
                <td className="p-3 font-semibold text-slate-800">{user.username}</td>
                <td className="p-3">{user.role === 'admin' ? <span className="inline-flex items-center gap-1 text-emerald-700"><ShieldCheck className="w-4 h-4" />Administrador</span> : <span className="inline-flex items-center gap-1 text-amber-700"><UserCheck className="w-4 h-4" />Vaquero</span>}</td>
                <td className="p-3">{user.active ? <span className="text-emerald-700 font-semibold">Activo</span> : <span className="text-slate-400 font-semibold">Inactivo</span>}</td>
                <td className="p-3"><div className="flex justify-end gap-1">
                  <button onClick={() => void toggle(user)} disabled={loading} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30" title={user.active ? 'Desactivar' : 'Activar'}>{user.active ? <UserX className="w-4 h-4 text-amber-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}</button>
                  <button onClick={() => void resetPassword(user)} disabled={loading} className="p-2 rounded-lg hover:bg-slate-100" title="Cambiar contraseña"><KeyRound className="w-4 h-4 text-slate-600" /></button>
                  <button onClick={() => void remove(user)} disabled={loading || (user.username === 'admin' && users.filter(u => u.role === 'admin' && u.active).length <= 1)} className="p-2 rounded-lg hover:bg-rose-50 disabled:opacity-30" title="Eliminar"><Trash2 className="w-4 h-4 text-rose-600" /></button>
                </div></td>
              </tr>)}
              {!users.length && !loading && <tr><td colSpan={4} className="p-6 text-center text-slate-400">No hay usuarios.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
