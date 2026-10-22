import { Link } from "react-router-dom";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
}

// Tarjeta de un producto: link al detalle + botón "Agregar al carrito" (cantidad 1).
function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__link">
        <span className="product-card__image" aria-hidden="true">
          {product.image ?? "📦"}
        </span>
        <h2 className="product-card__name">{product.name}</h2>
      </Link>

      <span className="product-card__category">{product.category}</span>

      <p className="product-card__price">${product.price.toLocaleString("es-AR")}</p>

      <p className="product-card__stock">
        {product.stock > 0 ? `Stock: ${product.stock}` : "Sin stock"}
      </p>

      <button
        type="button"
        className="button button--primary"
        onClick={() => addToCart(product, 1)}
        disabled={product.stock === 0}
      >
        Agregar al carrito
      </button>
    </article>
  );
}

export default ProductCard;
