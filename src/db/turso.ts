/**
 * Browser-safe Turso API helpers.
 *
 * The Turso URL and auth token stay exclusively on the Vercel server.
 * The React app talks to /api/* instead of connecting to Turso directly.
 */
export async function testTursoConnection(): Promise<{ success: boolean; latencyMs?: number; error?: string }> {
  try {
    const response = await fetch('/api/health/turso', { cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { success: false, error: data?.error || 'No se pudo conectar con Turso.' };
    return { success: true, latencyMs: data?.latencyMs };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error de conexión.' };
  }
}

export function isTursoConfigured(): boolean {
  return typeof window !== 'undefined';
}

export function getTursoUrl(): string {
  return '/api';
}
