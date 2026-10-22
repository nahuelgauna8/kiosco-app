import type { CartItem as CartItemType } from "../types";
import { useCart } from "../context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

// Fila de un producto dentro del carrito:
// permite cambiar la cantidad, ver el subtotal y eliminar el ítem.
function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  const subtotal = product.price * quantity;

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value, 10);
    // Si el input queda vacío o no es número, actualizamos a 1.
    updateQuantity(product.id, isNaN(newQuantity) ? 1 : newQuantity);
  };

  return (
    <li className="cart-item">
      <span className="cart-item__image" aria-hidden="true">
        {product.image ?? "📦"}
      </span>

      <div className="cart-item__info">
        <span className="cart-item__name">{product.name}</span>
        <span className="cart-item__price">
          ${product.price.toLocaleString("es-AR")} c/u
        </span>
      </div>

      <div className="cart-item__quantity">
        <button
          type="button"
          className="cart-item__qty-button"
          onClick={() => updateQuantity(product.id, quantity - 1)}
          aria-label={`Restar un ${product.name}`}
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={product.stock}
          value={quantity}
          onChange={handleQuantityChange}
          aria-label={`Cantidad de ${product.name}`}
        />
        <button
          type="button"
          className="cart-item__qty-button"
          onClick={() => updateQuantity(product.id, quantity + 1)}
          aria-label={`Sumar un ${product.name}`}
        >
          +
        </button>
      </div>

      <span className="cart-item__subtotal">
        ${subtotal.toLocaleString("es-AR")}
      </span>

      <button
        type="button"
        className="cart-item__remove"
        onClick={() => removeFromCart(product.id)}
        aria-label={`Eliminar ${product.name} del carrito`}
      >
        🗑️ Eliminar
      </button>
    </li>
  );
}

export default CartItem;
