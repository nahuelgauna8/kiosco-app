import { useState } from "react";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

// Página del carrito: listado, cantidades, total y acciones.
function Cart() {
  const { items, clearCart, totalItems, totalPrice } = useCart();

  // Mensaje de confirmación del pedido (Parte 1: simulado, sin llamar a ninguna API).
  // En la Parte 2 se reemplaza por el POST /api/orders con loading y errores reales.
  const [orderMessage, setOrderMessage] = useState<string | null>(null);

  const handleFinishOrder = () => {
    // SIMULACIÓN de éxito: en la Parte 2 esto será un fetch al backend.
    setOrderMessage(
      `¡Pedido confirmado! 🎉 Llevás ${totalItems} unidad(es) por $${totalPrice.toLocaleString("es-AR")}. ¡Gracias por tu compra!`,
    );
    clearCart();
  };

  const handleClearCart = () => {
    setOrderMessage(null);
    clearCart();
  };

  // Carrito vacío (y sin mensaje de pedido pendiente).
  if (items.length === 0) {
    return (
      <section className="page">
        <h1>Tu carrito</h1>
        {orderMessage ? (
          <p className="cart__message cart__message--success">{orderMessage}</p>
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

      {orderMessage && (
        <p className="cart__message cart__message--success">{orderMessage}</p>
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
          >
            Vaciar carrito
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={handleFinishOrder}
          >
            Finalizar pedido
          </button>
        </div>
      </div>
    </section>
  );
}

export default Cart;
