import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CircleCheck,
  ClipboardCheck,
  LoaderCircle,
  Trash2,
  TriangleAlert,
  RefreshCw,
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

  // Estados del formulario de confirmación de pedido.
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryName, setDeliveryName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");

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
          customer_name: customerName,
          delivery_method: deliveryMethod,
          delivery_address: deliveryMethod === "delivery" ? deliveryAddress : undefined,
          delivery_name: deliveryMethod === "delivery" ? deliveryName : undefined,
          payment_method: paymentMethod,
        },
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
      setShowOrderForm(false);
    }
  };

  const handleConfirmOrder = () => {
    setFormError(null);

    if (!customerName.trim()) {
      setFormError("Ingresá tu nombre para continuar.");
      return;
    }

    if (deliveryMethod === "delivery") {
      if (!deliveryAddress.trim()) {
        setFormError("Ingresá la dirección de envío.");
        return;
      }
      if (!deliveryName.trim()) {
        setFormError("Ingresá el nombre para el envío.");
        return;
      }
    }

    setShowOrderForm(false);
    handleFinishOrder();
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
            onClick={() => setShowOrderForm(true)}
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
                Proceder al pedido
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de confirmación de pedido */}
      {showOrderForm && (
        <section className="page cart">
          <h1>Confirmar pedido</h1>

          {formError && (
            <div className="status-message status-message--error" role="alert">
              <TriangleAlert size={22} aria-hidden="true" />
              <p>{formError}</p>
            </div>
          )}

          <div className="cart__summary">
            <div className="order-form">
              <div className="form-field">
                <label htmlFor="customer-name" className="form-field__label">
                  Tu nombre
                </label>
                <input
                  id="customer-name"
                  type="text"
                  name="customer_name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="form-field__input"
                />
              </div>

              <div className="form-field">
                <label className="form-field__label">¿Cómo retirás tu pedido?</label>
                <div className="delivery-options">
                  <label className="delivery-option">
                    <input
                      type="radio"
                      name="delivery_method"
                      value="pickup"
                      checked={deliveryMethod === "pickup"}
                      onChange={() => setDeliveryMethod("pickup")}
                    />
                    <span>Retiro en el kiosco</span>
                  </label>
                  <label className="delivery-option">
                    <input
                      type="radio"
                      name="delivery_method"
                      value="delivery"
                      checked={deliveryMethod === "delivery"}
                      onChange={() => setDeliveryMethod("delivery")}
                    />
                    <span>Envío a domicilio</span>
                  </label>
                </div>
              </div>

              {deliveryMethod === "delivery" && (
                <>
                  <div className="form-field">
                    <label htmlFor="delivery-address" className="form-field__label">
                      Dirección de envío
                    </label>
                    <input
                      id="delivery-address"
                      type="text"
                      name="delivery_address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Ej: Calle Falsa 123"
                      className="form-field__input"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="delivery-name" className="form-field__label">
                      Nombre para el envío
                    </label>
                    <input
                      id="delivery-name"
                      type="text"
                      name="delivery_name"
                      value={deliveryName}
                      onChange={(e) => setDeliveryName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="form-field__input"
                    />
                  </div>
                </>
              )}

              <div className="form-field">
                <label className="form-field__label">Medio de pago</label>
                <div className="delivery-options">
                  <label className="delivery-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                    <span>Efectivo</span>
                  </label>
                  <label className="delivery-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value="transfer"
                      checked={paymentMethod === "transfer"}
                      onChange={() => setPaymentMethod("transfer")}
                    />
                    <span>Transferencia</span>
                  </label>
                </div>
              </div>

              <div className="order-form__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setShowOrderForm(false)}
                  disabled={submitting}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Volver al carrito
                </button>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <LoaderCircle
                        className="status-message__spinner"
                        size={16}
                        aria-hidden="true"
                      />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} aria-hidden="true" />
                      Confirmar pedido
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}

export default Cart;