import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingCart, Trash2, X } from "lucide-react";
import CartItem from "./CartItem";
import { useCart } from "../context/CartContext";

// Panel lateral deslizante (drawer) del carrito.
// Se abre con el botón del header sin navegar a otra ruta: resume los ítems,
// permite cambiar cantidades y muestra el total con impuestos para ir al checkout.
function CartDrawer() {
  const { isCartOpen, closeCart, items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  // Mientras está abierto: bloqueamos el scroll del fondo y cerramos con Escape.
  // (Es una sincronización con el DOM externo: el effect es el lugar correcto.)
  useEffect(() => {
    if (!isCartOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  const handleCheckout = () => {
    closeCart();
    navigate("/cart"); // La página /cart conserva el "Finalizar pedido" (POST /api/orders).
  };

  const handleExplore = () => {
    closeCart();
    navigate("/products");
  };

  return (
    <>
      {/* Fondo oscuro: al hacer clic se cierra el panel */}
      <div
        className={`drawer__backdrop${isCartOpen ? " is-open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside
        className={`drawer${isCartOpen ? " is-open" : ""}`}
        aria-label="Carrito de compras"
        aria-hidden={!isCartOpen}
      >
        <div className="drawer__header">
          <h2 className="drawer__title">
            <ShoppingCart size={20} strokeWidth={2.25} aria-hidden="true" />
            Carrito de Compras
          </h2>
          <button type="button" className="drawer__close" onClick={closeCart}>
            <X size={18} aria-hidden="true" />
            Cerrar
          </button>
        </div>

        <div className="drawer__body">
          {items.length === 0 ? (
            <div className="drawer__empty">
              <ShoppingCart size={44} strokeWidth={1.5} aria-hidden="true" />
              <p>Tu carrito está vacío.</p>
              <button
                type="button"
                className="button button--secondary"
                onClick={handleExplore}
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <ul className="drawer__list">
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer__footer">
            <div className="drawer__line">
              <span>Subtotal</span>
              <span>${totalPrice.toLocaleString("es-AR")}</span>
            </div>
            <div className="drawer__line">
              <span>Envío</span>
              <span>Calculado en checkout</span>
            </div>
            <div className="drawer__total">
              <span>Total (con impuestos):</span>
              <strong>${totalPrice.toLocaleString("es-AR")}</strong>
            </div>
            <p className="drawer__note">IVA incluido en los precios.</p>

            <button
              type="button"
              className="button button--primary drawer__checkout"
              onClick={handleCheckout}
            >
              Proceder al Pago
              <ArrowRight size={17} aria-hidden="true" />
            </button>

            <button type="button" className="drawer__clear" onClick={clearCart}>
              <Trash2 size={14} aria-hidden="true" />
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
