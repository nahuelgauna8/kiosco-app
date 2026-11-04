import { Link } from "react-router-dom";
import {
  PackagePlus,
  Pencil,
  ShoppingCart,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { LOW_STOCK_THRESHOLD } from "../data/constants";
import { CATEGORIES } from "../data/categories";
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

// Tarjeta de un producto (rediseño estilo Uiverse):
// - Imagen enmarcada con fondo cálido sutil + zoom suave al pasar el cursor.
// - Chip de categoría con icono Lucide, nombre, precio destacado y stock con
//   punto de estado (verde / ámbar si está bajo / rojo si está agotado).
// - Elevación fluida: sombra suave que sube a shadow-xl + hover:-translate-y-1.5.
// Con sesión de admin activa se agrega: alerta de stock bajo flotante y
// botones de editar / reponer / eliminar (edición inline en el catálogo).
function ProductCard({ product, adminActions }: ProductCardProps) {
  const { addToCart } = useCart();

  // Alerta de stock bajo: quedan menos de 5 unidades (y aún no se agotó).
  const isLowStock =
    product.stock > 0 && product.stock < LOW_STOCK_THRESHOLD;

  // Chip de categoría: icono vectorial + etiqueta legible ("Bebidas", etc.).
  const categoryInfo = CATEGORIES.find(
    (category) => category.id === product.category,
  );

  // Estado visual del stock para el punto de color (ok / low / out).
  const stockState = product.stock === 0 ? "out" : isLowStock ? "low" : "ok";

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__link">
        {/* Imagen enmarcada; el badge de stock bajo flota encima (modo admin) */}
        <div className="product-card__media">
          <ProductImage product={product} className="product-card__image" />

          {adminActions && isLowStock && (
            <span className="product-card__lowstock">
              <TriangleAlert size={13} aria-hidden="true" />
              Stock bajo
            </span>
          )}
        </div>

        <span className="product-card__category">
          {categoryInfo && (
            <categoryInfo.icon size={13} strokeWidth={2.5} aria-hidden="true" />
          )}
          {categoryInfo ? categoryInfo.label : product.category}
        </span>

        <h2 className="product-card__name">{product.name}</h2>

        <p className="product-card__price">
          ${product.price.toLocaleString("es-AR")}
        </p>

        <p className={`product-card__stock product-card__stock--${stockState}`}>
          <span className="product-card__stock-dot" aria-hidden="true" />
          {product.stock > 0 ? `Stock: ${product.stock}` : "Sin stock"}
        </p>
      </Link>

      {/* Suma 1 unidad al carrito (misma lógica y evento de siempre) */}
      <button
        type="button"
        className="button button--primary product-card__cart"
        onClick={() => addToCart(product, 1)}
        disabled={product.stock === 0}
      >
        <ShoppingCart size={17} aria-hidden="true" />
        Agregar al carrito
      </button>

      {/* Acciones rápidas de administración (solo con sesión activa) */}
      {adminActions && (
        <div
          className="product-card__admin"
          role="group"
          aria-label="Acciones de administración"
        >
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
