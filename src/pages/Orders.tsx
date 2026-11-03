import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Order } from "../types";
import { ApiError, getOrders } from "../services/api";

// Formatea la fecha ISO que devuelve el backend (2026-11-03T22:11:48)
// como fecha y hora local legibles.
function formatFecha(isoDate: string): string {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime())
    ? isoDate
    : date.toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
      });
}

// Página "Mis pedidos": historial de pedidos creados (GET /api/orders).
function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

    getOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar los pedidos. Intentá de nuevo.",
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
    <section className="page orders">
      <h1>Mis pedidos</h1>

      {/* Estado de carga */}
      {loading && (
        <p className="status-message status-message--loading" role="status">
          Cargando pedidos...
        </p>
      )}

      {/* Estado de error */}
      {!loading && error && (
        <div className="status-message status-message--error" role="alert">
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

      {/* Sin pedidos todavía */}
      {!loading && !error && orders.length === 0 && (
        <>
          <p>Todavía no hiciste pedidos.</p>
          <Link to="/products" className="button button--primary">
            Explorar productos
          </Link>
        </>
      )}

      {/* Lista de pedidos: del más reciente al más antiguo */}
      {!loading && !error && orders.length > 0 && (
        <ul className="orders__list">
          {orders.map((order) => (
            <li key={order.id} className="order-card">
              <div className="order-card__header">
                <span className="order-card__id">Pedido #{order.id}</span>
                <span className="order-card__date">
                  {formatFecha(order.created_at)}
                </span>
              </div>

              <ul className="order-card__items">
                {order.items.map((item) => (
                  <li key={item.product_id}>
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span>
                      ${(item.price * item.quantity).toLocaleString("es-AR")}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="order-card__total">
                <span>Total</span>
                <strong>${order.total.toLocaleString("es-AR")}</strong>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Orders;
