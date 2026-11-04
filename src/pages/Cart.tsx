import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CircleCheck,
  ClipboardCheck,
  LoaderCircle,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";
import { ApiError, createOrder } from "../services/api";
import { notifyNewOrder } from "../services/orderEvents";

// Página del carrito: listado, cantidades, total y acciones.
function Cart() {
  const { items, clearCart, totalItems, totalPrice } = useCart();

  // Estados del "Finalizar pedido" (POST /api/orders).
  const [submitting, setSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const handleFinishOrder = async () => {
    setSubmitting(true);
    setOrderError(null);
    setOrderMessage(null);

    try {
      // Enviamos el pedido al backend: él valida el stock y lo descuenta.
      const order = await createOrder(
        items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      );

      // Éxito: confirmación visible y carrito vaciado.
      setOrderMessage(
        `¡Pedido #${order.id} confirmado! Llevás ${order.items.length} producto(s) por $${order.total.toLocaleString("es-AR")}. ¡Gracias por tu compra!`,
      );
      clearCart();
      // Notifica a cualquier pestaña del Panel de Administración para que
      // refresque las métricas del dashboard sin recargar la página.
      notifyNewOrder();
    } catch (err: unknown) {
      // Error visible en pantalla: stock insuficiente, validación o red caída.
      setOrderError(
        err instanceof ApiError
          ? err.message
          : "No se pudo enviar el pedido. Intentá de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearCart = () => {
    setOrderMessage(null);
    setOrderError(null);
    clearCart();
  };

  // Carrito vacío (luego de finalizar o si nunca agregó nada).
  if (items.length === 0) {
    return (
      <section className="page">
        <h1>Tu carrito</h1>
        {orderError ? (
          <p className="status-message status-message--error" role="alert">
            <TriangleAlert size={20} aria-hidden="true" />
            {orderError}
          </p>
        ) : orderMessage ? (
          <div className="cart__order-done">
            <p className="cart__message cart__message--success">
              <CircleCheck size={18} aria-hidden="true" />
              {orderMessage}
            </p>
            <Link to="/orders" className="button button--secondary">
              Ver mis pedidos
            </Link>
          </div>
        ) : (
          <p>Tu carrito está vacío.</p>
        )}
        <Link to="/products" className="button button--primary">
          Ir al catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="page cart">
      <h1>Tu carrito</h1>

      {orderError && (
        <div className="status-message status-message--error" role="alert">
          <TriangleAlert size={22} aria-hidden="true" />
          <p>{orderError}</p>
        </div>
      )}

      <ul className="cart__list">
        {items.map((item) => (
          <CartItem key={item.product.id} item={item} />
        ))}
      </ul>

      <div className="cart__summary">
        <p className="cart__totals">
          <span>
            Total: <strong>{totalItems} unidad(es)</strong>
          </span>
          <span className="cart__total-price">
            ${totalPrice.toLocaleString("es-AR")}
          </span>
        </p>

        <div className="cart__actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={handleClearCart}
            disabled={submitting}
          >
            <Trash2 size={16} aria-hidden="true" />
            Vaciar carrito
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={handleFinishOrder}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <LoaderCircle
                  className="status-message__spinner"
                  size={16}
                  aria-hidden="true"
                />
                Enviando pedido...
              </>
            ) : (
              <>
                <ClipboardCheck size={16} aria-hidden="true" />
                Finalizar pedido
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Cart;
