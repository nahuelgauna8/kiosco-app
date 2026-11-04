import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { adminLogin, adminValidateSession, ApiError } from "../services/api";
import {
  clearAdminSession,
  loadAdminSession,
  saveAdminSession,
} from "../services/adminSession";

// Valor que expone el Context de administración a toda la app.
interface AdminContextValue {
  // ¿Hay una sesión de admin válida (token presente y sin vencer)?
  isAdmin: boolean;
  // Ingresa con la clave y guarda el token (lanza ApiError si es incorrecta).
  login: (password: string) => Promise<void>;
  // Cierra la sesión (borra el token del navegador).
  logout: () => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

// Cada cuánto se re-valida el token contra el backend mientras la pestaña
// está abierta (detecta tokens vencidos o un secreto rotado).
const VALIDATE_INTERVAL_MS = 5 * 60 * 1000;

export function AdminProvider({ children }: { children: ReactNode }) {
  // Estado inicial: lo que haya guardado en localStorage (inicialización perezosa).
  const [isAdmin, setIsAdmin] = useState<boolean>(
    () => loadAdminSession() !== null,
  );

  const logout = useCallback(() => {
    clearAdminSession();
    setIsAdmin(false);
  }, []);

  const login = useCallback(async (password: string) => {
    // Si la clave está mal, adminLogin lanza ApiError 401 y no se guarda nada.
    const session = await adminLogin(password);
    saveAdminSession(session.token, session.expires_at);
    setIsAdmin(true);
  }, []);

  // Mientras haya sesión, la validamos contra el backend: si responde 401
  // (token vencido o secreto cambiado), cerramos sesión automáticamente.
  useEffect(() => {
    if (!isAdmin) return;

    const validate = () => {
      adminValidateSession().catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) logout();
        // Un error de red no cierra la sesión: se reintentará en el próximo chequeo
        // (y cada request admin individual también valida contra el backend).
      });
    };

    validate();
    const interval = setInterval(validate, VALIDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAdmin, logout]);

  const value = useMemo(
    () => ({ isAdmin, login, logout }),
    [isAdmin, login, logout],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

// Hook para consumir la sesión de admin. Fuera del Provider lanza un error
// claro en lugar de fallar en silencio.
export function useAdmin() {
  const context = useContext(AdminContext);

  if (context === undefined) {
    throw new Error("useAdmin debe usarse dentro de un <AdminProvider>");
  }

  return context;
}
