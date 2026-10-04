export type UserRole = 'admin' | 'vaquero';

export type AuthUser = {
  username: string;
  role: UserRole;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.authenticated ? data.user : null;
  } catch {
    return null;
  }
}

export async function login(username: string, password: string, role: UserRole): Promise<AuthUser> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'No se pudo iniciar sesión.');
  return data.user as AuthUser;
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}
