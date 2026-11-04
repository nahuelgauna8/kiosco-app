import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle, Receipt, Trash2, TriangleAlert } from "lucide-react";
import type { Order } from "../types";
import { ApiError, deleteOrders, getOrders } from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";

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

  // Borrar historial (DELETE /api/orders).
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Diálogo de confirmación (modal propio, sin window.confirm).
  const [confirmOpen, setConfirmOpen] = useState(false);
  const clearButtonRef = useRef<HTMLButtonElement>(null);

  // Al reintentar volvemos al estado de carga (durante el render, sin effect).
  const [prevRetryKey, setPrevRetryKey] = useState(retryKey);

  if (prevRetryKey !== retryKey) {
    setPrevRetryKey(retryKey);
    setLoading(true);
    setError(null);
    setNotice(null);
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

  // Borra todo el historial: el modal pide confirmación antes de ejecutar.
  const handleConfirmClear = async () => {
    setDeleting(true);
    setError(null);
    setNotice(null);

    try {
      await deleteOrders();
      setOrders([]);
      setNotice("Historial borrado correctamente.");
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo borrar el historial. Intentá de nuevo.",
      );
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      // El botón puede desaparecer (historial vacío): el foco vuelve a la página.
      clearButtonRef.current?.focus();
    }
  };

  return (
    <section className="page orders">
      <div className="orders__topbar">
        <h1>Mis pedidos</h1>

        {/* Solo se muestra si hay pedidos para borrar */}
        {!loading && !error && orders.length > 0 && (
          <button
            type="button"
            className="button button--secondary orders__clear"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            ref={clearButtonRef}
          >
            <Trash2 size={16} aria-hidden="true" />
            Borrar historial
          </button>
        )}
      </div>

      {/* Modal de confirmación para borrar el historial */}
      <ConfirmDialog
        open={confirmOpen}
        title="¿Borrar todo el historial?"
        message="Se eliminarán todos tus pedidos registrados. Esta acción no se puede deshacer."
        confirmLabel="Borrar historial"
        cancelLabel="Cancelar"
        busy={deleting}
        onConfirm={handleConfirmClear}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Confirmación de que se borró */}
      {!loading && !error && notice && (
        <p className="orders__notice" role="status">
          {notice}
        </p>
      )}

      {/* Estado de carga */}
      {loading && (
        <p className="status-message status-message--loading" role="status">
          <LoaderCircle
            className="status-message__spinner"
            size={18}
            aria-hidden="true"
          />
          Cargando pedidos...
        </p>
      )}

      {/* Estado de error */}
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
                <span className="order-card__id">
                  <Receipt size={15} aria-hidden="true" />
                  Pedido #{order.id}
                </span>
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
