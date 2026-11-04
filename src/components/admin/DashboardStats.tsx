import type { AdminStats } from "../../types";

interface DashboardStatsProps {
  stats: AdminStats;
}

// Tarjetas del resumen del dashboard: pedidos del día, ingresos,
// productos en catálogo y alerta de stock bajo (menos de 5 unidades).
function DashboardStats({ stats }: DashboardStatsProps) {
  const hasLowStock = stats.low_stock.length > 0;

  return (
    <>
      <div className="admin__stats">
        <div className="stat-card">
          <span className="stat-card__icon" aria-hidden="true">🧾</span>
          <p className="stat-card__value">{stats.orders_today}</p>
          <p className="stat-card__label">Pedidos de hoy</p>
        </div>

        <div className="stat-card">
          <span className="stat-card__icon" aria-hidden="true">💰</span>
          <p className="stat-card__value">
            ${stats.revenue_today.toLocaleString("es-AR")}
          </p>
          <p className="stat-card__label">Ingresos de hoy</p>
        </div>

        <div className="stat-card">
          <span className="stat-card__icon" aria-hidden="true">📦</span>
          <p className="stat-card__value">{stats.total_products}</p>
          <p className="stat-card__label">Productos en catálogo</p>
        </div>

        <div className={`stat-card${hasLowStock ? " stat-card--alert" : ""}`}>
          <span className="stat-card__icon" aria-hidden="true">⚠️</span>
          <p className="stat-card__value">{stats.low_stock.length}</p>
          <p className="stat-card__label">Por agotarse (menos de 5)</p>
        </div>
      </div>

      {hasLowStock && (
        <div className="admin__lowstock">
          <h3>⚠️ Productos con stock bajo</h3>
          <ul>
            {stats.low_stock.map((product) => (
              <li key={product.id}>
                {product.name} — quedan{" "}
                {product.stock === 1 ? "1 unidad" : `${product.stock} unidades`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default DashboardStats;
