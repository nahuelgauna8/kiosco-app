import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CirclePlus,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Store,
  TriangleAlert,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import type { AdminStats } from "../../types";
import { adminGetStats, ApiError } from "../../services/api";
import DashboardStats from "./DashboardStats";
import ProductCreateForm from "./ProductCreateForm";

// Panel de administración (vista central en /admin):
// - Resumen del dashboard (pedidos del día, ingresos, stock bajo).
// - Formulario para cargar productos nuevos al catálogo.
// La edición inline (reponer/editar/eliminar) vive en el catálogo público.
function AdminPanel() {
  const { logout } = useAdmin();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Permite reintentar y refrescar (tras crear un producto) sin recargar.
  const [retryKey, setRetryKey] = useState(0);

  // Al reintentar volvemos al estado de carga (durante el render, sin effect).
  const [prevRetryKey, setPrevRetryKey] = useState(retryKey);

  if (prevRetryKey !== retryKey) {
    setPrevRetryKey(retryKey);
    setLoading(true);
    setError(null);
  }

  useEffect(() => {
    let cancelled = false;

    adminGetStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // 401: la sesión venció; AdminContext la cierra y /admin muestra el login.
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudo cargar el resumen. Intentá de nuevo.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  return (
    <section className="page admin-panel">
      <div className="admin__topbar">
        <h1>
          <LayoutDashboard size={26} strokeWidth={2.25} aria-hidden="true" />
          Panel de administración
        </h1>
        <div className="admin__topbar-actions">
          <Link to="/products" className="button button--secondary">
            <Store size={16} aria-hidden="true" />
            Ver catálogo
          </Link>
          <button
            type="button"
            className="button button--secondary"
            onClick={logout}
          >
            <LogOut size={16} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ===== Resumen del dashboard ===== */}
      <section className="admin__section" aria-labelledby="admin-stats-title">
        <h2 id="admin-stats-title">
          <BarChart3 size={20} aria-hidden="true" />
          Resumen
        </h2>

        {loading && (
          <p className="status-message status-message--loading" role="status">
            <LoaderCircle
              className="status-message__spinner"
              size={18}
              aria-hidden="true"
            />
            Cargando resumen...
          </p>
        )}

        {!loading && error && (
          <div className="status-message status-message--error" role="alert">
            <TriangleAlert size={22} aria-hidden="true" />
            <p>{error}</p>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setRetryKey((key) => key + 1)}
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && stats && <DashboardStats stats={stats} />}
      </section>

      {/* ===== Carga de productos nuevos ===== */}
      <section className="admin__section" aria-labelledby="admin-create-title">
        <h2 id="admin-create-title">
          <CirclePlus size={20} aria-hidden="true" />
          Cargar producto nuevo
        </h2>
        <ProductCreateForm onCreated={() => setRetryKey((key) => key + 1)} />
      </section>
    </section>
  );
}

export default AdminPanel;
