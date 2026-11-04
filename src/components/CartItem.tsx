import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "../types";
import { useCart } from "../context/CartContext";
import ProductImage from "./ProductImage";

interface CartItemProps {
  item: CartItemType;
}

// Fila de un producto dentro del carrito (se usa en el panel lateral y en
// la página /cart): imagen, nombre, control de cantidades, subtotal y eliminar.
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
      <ProductImage product={product} className="cart-item__image" />

      <div className="cart-item__info">
        <span className="cart-item__name">{product.name}</span>

        <div className="cart-item__quantity">
          <button
            type="button"
            className="cart-item__qty-button"
            onClick={() => updateQuantity(product.id, quantity - 1)}
            aria-label={`Restar un ${product.name}`}
          >
            <Minus size={14} aria-hidden="true" />
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
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="cart-item__side">
        <span className="cart-item__subtotal">
          ${subtotal.toLocaleString("es-AR")}
        </span>
        <button
          type="button"
          className="cart-item__remove"
          onClick={() => removeFromCart(product.id)}
          aria-label={`Eliminar ${product.name} del carrito`}
          title="Eliminar del carrito"
        >
          <Trash2 size={14} aria-hidden="true" />
          Quitar
        </button>
      </div>
    </li>
  );
}

export default CartItem;
