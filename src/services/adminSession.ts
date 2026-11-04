// Persistencia de la sesión de administrador en localStorage.
//
// Guardamos el token que entrega POST /api/admin/login junto con su
// expiración (epoch en milisegundos). El backend es quien valida el token
// en cada request: esto solo evita pedir la clave en cada carga de página.
const ADMIN_SESSION_KEY = "kiosco-admin-session-v1";

// Guarda la sesión (el expiresAt viene en segundos Unix desde el backend).
export function saveAdminSession(token: string, expiresAtSeconds: number): void {
  try {
    localStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({ token, expiresAt: expiresAtSeconds * 1000 }),
    );
  } catch {
    // Sin storage: la sesión vivirá solo en memoria de este render.
  }
}

// Devuelve el token si existe y no venció; si venció o está corrupto, limpia.
export function loadAdminSession(): string | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const { token, expiresAt } = parsed as Record<string, unknown>;
    if (typeof token !== "string" || typeof expiresAt !== "number") return null;

    if (expiresAt <= Date.now()) {
      clearAdminSession(); // Venció: la sacamos para no arrastrar tokens viejos.
      return null;
    }

    return token;
  } catch {
    return null; // JSON inválido o localStorage inaccesible.
  }
}

// Elimina la sesión (logout o expiración).
export function clearAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // Sin storage: no había nada que limpiar.
  }
}
