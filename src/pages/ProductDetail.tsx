import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  LoaderCircle,
  Package,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";
import type { Product } from "../types";
import { ApiError, getProductById, resolveImageUrl } from "../services/api";
import { useCart } from "../context/CartContext";
import { CATEGORIES } from "../data/categories";

// Página de detalle de producto.
// El id viene de la URL (path param): /products/:id
// El producto se carga desde el backend (GET /api/products/{id}).
//
// Diseño e-commerce profesional:
// - Desktop (>=900px): grid de 2 columnas (galería izquierda | información derecha).
// - Móvil: 1 columna apilada.
function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const requestKey = `${id}#${retryKey}`;
  const [prevRequestKey, setPrevRequestKey] = useState(requestKey);

  if (prevRequestKey !== requestKey) {
    setPrevRequestKey(requestKey);
    setLoading(true);
    setError(null);
    setNotFound(false);
    setProduct(null);
    setQuantity(1);
  }

  useEffect(() => {
    let cancelled = false;

    getProductById(Number(id))
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err instanceof ApiError
              ? err.message
              : "No se pudo cargar el producto. Intentá de nuevo.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, retryKey]);

  if (loading) {
    return (
      <section className="page">
        <p className="status-message status-message--loading" role="status">
          <LoaderCircle className="status-message__spinner" size={18} aria-hidden="true" />
          Cargando producto...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <div className="status-message status-message--error" role="alert">
          <TriangleAlert size={22} aria-hidden="true" />
          <p>{error}</p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setRetryKey((key) => key + 1)}
          >
            Reintentar
          </button>
        </div>
        <Link to="/products" className="button button--primary">
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al catálogo
        </Link>
      </section>
    );
  }

  if (notFound || !product) {
    return (
      <section className="page">
        <h1>Producto no encontrado</h1>
        <p>No encontramos el producto con id "{id}".</p>
        <Link to="/products" className="button button--primary">
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al catálogo
        </Link>
      </section>
    );
  }

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value, 10);
    setQuantity(isNaN(newQuantity) ? 1 : newQuantity);
  };

  const handleAddToCart = () => {
    addToCart(product, Math.max(1, quantity));
  };

  const categoryInfo = CATEGORIES.find(
    (category) => category.id === product.category,
  );

  // Galería simulada: como el modelo tiene una sola imagen, repetimos la
  // misma en las miniaturas para mantener la estructura de galería.
  const mainImageUrl = resolveImageUrl(product.image);
  const hasImage = Boolean(mainImageUrl);

  // Características: se muestran como lista de viñetas (una por entrada).
  const features = product.description ?? [];

  return (
    <section className="page product-detail">
      <div className="product-detail__grid">
        {/* ===== Columna izquierda: Imagen principal ===== */}
        <div className="product-detail__gallery">
          <div className="product-detail__main-image">
            {hasImage ? (
              <img
                src={mainImageUrl}
                alt={product.name}
                className="product-detail__main-img"
              />
            ) : (
              <div className="product-detail__main-placeholder">
                <Package size="4rem" strokeWidth={1.5} />
              </div>
            )}
          </div>
        </div>

        {/* ===== Columna derecha: Información del producto ===== */}
        <div className="product-detail__info">
          <span className="product-detail__category-badge">
            {categoryInfo && (
              <categoryInfo.icon size={13} strokeWidth={2.5} aria-hidden="true" />
            )}
            {categoryInfo ? categoryInfo.label : product.category}
          </span>

          <h1 className="product-detail__title">{product.name}</h1>

          <p className="product-detail__price">
            ${product.price.toLocaleString("es-AR")}
          </p>

          <p className={`
            product-detail__stock
            ${product.stock === 0 ? "product-detail__stock--out" : ""}
          `}>
            {product.stock > 0
              ? `Stock disponible: ${product.stock} unidad(es)`
              : "Sin stock"}
          </p>

          {features.length > 0 ? (
            <ul className="product-detail__features">
              {features.map((feature, index) => (
                <li key={index} className="product-detail__feature">
                  <CheckCircle size={14} strokeWidth={2} aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          ) : (
            <p className="product-detail__description">{product.description}</p>
          )}

          <div className="product-detail__actions">
            <div className="product-detail__actions-row">
              <label htmlFor="quantity" className="product-detail__quantity-label">
                Cantidad
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={handleQuantityChange}
                disabled={product.stock === 0}
                className="product-detail__quantity-input"
              />
            </div>
            <button
              type="button"
              className="button button--primary product-detail__add-to-cart"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart size={16} aria-hidden="true" />
              {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
            </button>
          </div>

          <Link to="/products" className="button button--secondary product-detail__back">
            <ArrowLeft size={16} aria-hidden="true" />
            Volver al catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
