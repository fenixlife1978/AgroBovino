import React, { useState } from 'react';
import { LockKeyhole, UserRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import type { AuthUser } from '../../auth';
import { login } from '../../auth';

interface LoginPageProps {
  onAuthenticated: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/app-icon.png" alt="AgroBovino" className="w-20 h-20 rounded-3xl mx-auto mb-5 shadow-2xl border border-emerald-400/30" />
          <h1 className="text-3xl font-black text-white tracking-tight">AgroBovino</h1>
          <p className="text-emerald-100/70 mt-2">Gestión ganadera · acceso al sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-7 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck className="w-5 h-5" /></div>
            <div>
              <h2 className="font-bold text-slate-900">Iniciar sesión</h2>
              <p className="text-xs text-slate-500">Ingrese la cuenta que le asignó el administrador</p>
            </div>
          </div>

          <label className="block text-sm font-semibold text-slate-700 mb-2">Usuario</label>
          <div className="relative mb-4">
            <UserRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="Ingrese su usuario"
              autoComplete="username"
              className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-3 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              required
            />
          </div>

          <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
          <div className="relative mb-5">
            <LockKeyhole className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              autoComplete="current-password"
              className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-11 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-700">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2.5 text-sm">{error}</div>}

          <button
            disabled={loading}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm transition-colors"
          >
            {loading ? 'Validando…' : 'Entrar al sistema'}
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-5">
            Acceso protegido para el personal autorizado de la finca.
          </p>
        </form>
      </div>
    </main>
  );
};
