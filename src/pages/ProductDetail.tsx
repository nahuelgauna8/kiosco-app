import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";

// Página de detalle de producto.
// El id viene de la URL (path param): /products/:id
function ProductDetail() {
  // useParams devuelve los path params como strings (id es string, hay que convertirlo).
  const { id } = useParams();

  const { addToCart } = useCart();

  // Cantidad elegida por el usuario (por defecto 1).
  const [quantity, setQuantity] = useState(1);

  // Buscamos el producto en el mock. Si el id no es un número válido, da undefined.
  const product = products.find((p) => p.id === Number(id));

  // Si no existe el producto, mostramos un mensaje con link para volver.
  if (!product) {
    return (
      <section className="page">
        <h1>Producto no encontrado</h1>
        <p>No encontramos el producto con id "{id}".</p>
        <Link to="/products" className="button button--primary">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // parseInt con NaN como respaldo si el input queda vacío.
    const newQuantity = parseInt(event.target.value, 10);
    setQuantity(isNaN(newQuantity) ? 1 : newQuantity);
  };

  const handleAddToCart = () => {
    // No permitimos cantidades menores a 1.
    addToCart(product, Math.max(1, quantity));
  };

  return (
    <section className="page product-detail">
      <span className="product-detail__image" aria-hidden="true">
        {product.image ?? "📦"}
      </span>

      <h1>{product.name}</h1>

      <span className="product-card__category">{product.category}</span>

      <p className="product-detail__price">
        ${product.price.toLocaleString("es-AR")}
      </p>

      <p className="product-detail__stock">
        {product.stock > 0 ? `Stock disponible: ${product.stock}` : "Sin stock"}
      </p>

      <p className="product-detail__description">{product.description}</p>

      <div className="product-detail__actions">
        <label htmlFor="quantity">Cantidad:</label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={product.stock}
          value={quantity}
          onChange={handleQuantityChange}
          disabled={product.stock === 0}
        />
        <button
          type="button"
          className="button button--primary"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          Agregar al carrito
        </button>
      </div>

      <Link to="/products" className="button button--secondary">
        ← Volver al catálogo
      </Link>
    </section>
  );
}

export default ProductDetail;
