import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CircleCheck,
  ClipboardCheck,
  LoaderCircle,
  ShoppingCart,
  Store,
  Trash2,
  TriangleAlert,
  Truck,
  Banknote,
  CreditCard,
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

  // Estado del flujo de checkout previo.
  const [checkout, setCheckout] = useState<{
    customer_name: string;
    delivery_method: "pickup" | "delivery";
    delivery_address: string;
    delivery_name: string;
    payment_method: "cash" | "transfer";
  } | null>(null);

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
        {
          customer_name: checkout!.customer_name,
          delivery_method: checkout!.delivery_method,
          delivery_address: checkout!.delivery_address,
          delivery_name: checkout!.delivery_name,
          payment_method: checkout!.payment_method,
        }
      );

      // Éxito: confirmación visible y carrito vaciado.
      setOrderMessage(
        `¡Pedido #${order.id} confirmado! Llevás ${order.items.length} producto(s) por $${order.total.toLocaleString("es-AR")}. ¡Gracias por tu compra!`
      );
      clearCart();
      // Notifica a cualquier pestaña del Panel de Administración para que
      // refresque las métricas del dashboard sin recargar la página.
      notifyNewOrder();
      setCheckout(null);
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
    setCheckout(null);
  };

  const startCheckout = () => {
    setCheckout({
      customer_name: "",
      delivery_method: "pickup",
      delivery_address: "",
      delivery_name: "",
      payment_method: "cash",
    });
    setOrderError(null);
    setOrderMessage(null);
  };

  const updateCheckout = (field: string, value: string) => {
    if (!checkout) return;
    setCheckout({ ...checkout, [field]: value } as typeof checkout);
  };

  const toggleDelivery = (method: "pickup" | "delivery") => {
    if (!checkout) return;
    setCheckout({ ...checkout, delivery_method: method });
  };

  const togglePayment = (method: "cash" | "transfer") => {
    if (!checkout) return;
    setCheckout({ ...checkout, payment_method: method });
  };

  const isCheckoutValid = () => {
    if (!checkout) return false;
    if (!checkout.customer_name.trim()) return false;
    if (checkout.delivery_method === "delivery") {
      if (!checkout.delivery_address.trim()) return false;
      if (!checkout.delivery_name.trim()) return false;
    }
    return true;
  };

  // Carrito vacío (luego de finalizar o si nunca agregó nada).
  if (items.length === 0 && !checkout) {
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

  // Vista de checkout (configuración del pedido).
  if (checkout) {
    return (
      <section className="page cart">
        <div className="cart__header">
          <Link to="/cart" className="button button--secondary" onClick={() => setCheckout(null)}>
            <ArrowLeft size={16} aria-hidden="true" />
            Volver al carrito
          </Link>
          <h1>Resumen del pedido</h1>
        </div>

        <div className="checkout-card">
          <div className="checkout-field">
            <label htmlFor="checkout-customer-name">Tu nombre</label>
            <input
              id="checkout-customer-name"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={checkout.customer_name}
              onChange={(e) => updateCheckout("customer_name", e.target.value)}
            />
          </div>

          <div className="checkout-field">
            <label>Método de entrega</label>
            <div className="option-grid">
              <button
                type="button"
                className={`option-card option-card--delivery${
                  checkout.delivery_method === "pickup" ? " is-selected" : ""
                }`}
                onClick={() => toggleDelivery("pickup")}
                aria-pressed={checkout.delivery_method === "pickup"}
              >
                <span className="option-card__icon">
                  <Store size={28} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="option-card__title">Retiro en kiosco</span>
                <span className="option-card__subtitle">Pasás por el local</span>
              </button>
              <button
                type="button"
                className={`option-card option-card--delivery${
                  checkout.delivery_method === "delivery" ? " is-selected" : ""
                }`}
                onClick={() => toggleDelivery("delivery")}
                aria-pressed={checkout.delivery_method === "delivery"}
              >
                <span className="option-card__icon">
                  <Truck size={28} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="option-card__title">Envío a domicilio</span>
                <span className="option-card__subtitle">Te lo llevamos</span>
              </button>
            </div>
          </div>

          {checkout.delivery_method === "delivery" && (
            <>
              <div className="checkout-field">
                <label htmlFor="checkout-delivery-address">Dirección de envío</label>
                <input
                  id="checkout-delivery-address"
                  type="text"
                  placeholder="Ej: Calle Falsa 123"
                  value={checkout.delivery_address}
                  onChange={(e) => updateCheckout("delivery_address", e.target.value)}
                />
              </div>
              <div className="checkout-field">
                <label htmlFor="checkout-delivery-name">Nombre para el envío</label>
                <input
                  id="checkout-delivery-name"
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={checkout.delivery_name}
                  onChange={(e) => updateCheckout("delivery_name", e.target.value)}
                />
              </div>
            </>
          )}

          <div className="checkout-field">
            <label>Medio de pago</label>
            <div className="option-grid">
              <button
                type="button"
                className={`option-card option-card--payment${
                  checkout.payment_method === "cash" ? " is-selected" : ""
                }`}
                onClick={() => togglePayment("cash")}
                aria-pressed={checkout.payment_method === "cash"}
              >
                <span className="option-card__icon">
                  <Banknote size={28} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="option-card__title">Efectivo</span>
                <span className="option-card__subtitle">Pagás al recibir</span>
              </button>
              <button
                type="button"
                className={`option-card option-card--payment${
                  checkout.payment_method === "transfer" ? " is-selected" : ""
                }`}
                onClick={() => togglePayment("transfer")}
                aria-pressed={checkout.payment_method === "transfer"}
              >
                <span className="option-card__icon">
                  <CreditCard size={28} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="option-card__title">Transferencia</span>
                <span className="option-card__subtitle">Pagás por transferencia</span>
              </button>
            </div>
          </div>

          <div className="checkout-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setCheckout(null)}
            >
              Volver al carrito
            </button>
            <button
              type="button"
              className="button button--primary"
              disabled={submitting || !isCheckoutValid()}
              onClick={handleFinishOrder}
            >
              {submitting ? (
                <>
                  <LoaderCircle className="status-message__spinner" size={16} aria-hidden="true" />
                  Finalizando...
                </>
              ) : (
                <>
                  <ClipboardCheck size={16} aria-hidden="true" />
                  Finalizar el pedido
                </>
              )}
            </button>
          </div>
        </div>
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
            onClick={startCheckout}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <LoaderCircle className="status-message__spinner" size={16} aria-hidden="true" />
                Procediendo...
              </>
            ) : (
              <>
                <ShoppingCart size={18} aria-hidden="true" />
                Proceder al pedido
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Cart;
