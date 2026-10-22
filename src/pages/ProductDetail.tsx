import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Product } from "../types";
import { ApiError, getProductById } from "../services/api";
import { useCart } from "../context/CartContext";

// Página de detalle de producto.
// El id viene de la URL (path param): /products/:id
// El producto se carga desde el backend (GET /api/products/{id}).
function ProductDetail() {
  // useParams devuelve los path params como strings (id es string, hay que convertirlo).
  const { id } = useParams();

  const { addToCart } = useCart();

  // Cantidad elegida por el usuario (por defecto 1).
  const [quantity, setQuantity] = useState(1);

  // Estados de la petición a la API.
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setNotFound(false);
    setProduct(null);
    setQuantity(1); // Reseteamos la cantidad al cambiar de producto.

    getProductById(Number(id))
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        if (err instanceof ApiError && err.status === 404) {
          // El producto no existe en la base de datos.
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

  // Estado de carga: visible mientras espera la API.
  if (loading) {
    return (
      <section className="page">
        <p className="status-message status-message--loading" role="status">
          Cargando producto...
        </p>
      </section>
    );
  }

  // Estado de error: visible si falla la red o la API responde mal.
  if (error) {
    return (
      <section className="page">
        <div className="status-message status-message--error" role="alert">
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
          Volver al catálogo
        </Link>
      </section>
    );
  }

  // Producto inexistente (404 de la API).
  if (notFound || !product) {
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
    // parseInt con 1 como respaldo si el input queda vacío.
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
