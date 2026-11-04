import { Link } from "react-router-dom";
import { PackagePlus, Pencil, ShoppingCart, Trash2, TriangleAlert } from "lucide-react";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { LOW_STOCK_THRESHOLD } from "../data/constants";
import ProductImage from "./ProductImage";

// Acciones de administración que la página del catálogo le pasa a la tarjeta.
// Si no se pasan, la tarjeta se muestra en modo cliente (sin botones admin).
export interface ProductCardAdminActions {
  onEdit: (product: Product) => void;
  onRestock: (product: Product) => void;
  onDelete: (product: Product) => void;
}

interface ProductCardProps {
  product: Product;
  adminActions?: ProductCardAdminActions;
}

// Tarjeta de un producto: link al detalle + botón "Agregar al carrito" (cantidad 1).
// Con sesión de admin activa se agregan: alerta de stock bajo y botones de
// editar / reponer / eliminar (edición rápida inline en el catálogo).
function ProductCard({ product, adminActions }: ProductCardProps) {
  const { addToCart } = useCart();

  // Alerta de stock bajo: quedan menos de 5 unidades (y aún no se agotó).
  const isLowStock =
    product.stock > 0 && product.stock < LOW_STOCK_THRESHOLD;

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__link">
        <ProductImage product={product} className="product-card__image" />
        <h2 className="product-card__name">{product.name}</h2>
      </Link>

      <span className="product-card__category">{product.category}</span>

      <p className="product-card__price">${product.price.toLocaleString("es-AR")}</p>

      <p className="product-card__stock">
        {product.stock > 0 ? `Stock: ${product.stock}` : "Sin stock"}
      </p>

      {adminActions && isLowStock && (
        <span className="product-card__lowstock">
          <TriangleAlert size={14} aria-hidden="true" />
          Stock bajo
        </span>
      )}

      <button
        type="button"
        className="button button--primary"
        onClick={() => addToCart(product, 1)}
        disabled={product.stock === 0}
      >
        <ShoppingCart size={16} aria-hidden="true" />
        Agregar al carrito
      </button>

      {/* Acciones rápidas de administración (solo con sesión activa) */}
      {adminActions && (
        <div className="product-card__admin" role="group" aria-label="Acciones de administración">
          <button
            type="button"
            className="product-card__admin-btn"
            onClick={() => adminActions.onEdit(product)}
          >
            <Pencil size={14} aria-hidden="true" />
            Editar
          </button>
          <button
            type="button"
            className="product-card__admin-btn"
            onClick={() => adminActions.onRestock(product)}
          >
            <PackagePlus size={14} aria-hidden="true" />
            Reponer
          </button>
          <button
            type="button"
            className="product-card__admin-btn product-card__admin-btn--danger"
            onClick={() => adminActions.onDelete(product)}
          >
            <Trash2 size={14} aria-hidden="true" />
            Eliminar
          </button>
        </div>
      )}
    </article>
  );
}

export default ProductCard;
