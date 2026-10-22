import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";
import { ApiError, getProducts } from "../services/api";

// Categorías disponibles para el filtro.
const categories = ["todas", "bebidas", "snacks", "golosinas", "varios"] as const;

// Página de listado de productos.
// Carga los datos desde el backend (GET /api/products) y filtra con query param:
// /products?category=bebidas
function Products() {
  // useSearchParams reemplaza a useState para lo que vive en la query string:
  // [searchParams] = estado actual de la URL, setSearchParams = actualizar la URL.
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFilter = searchParams.get("category") ?? "todas";

  // Estados de la petición a la API (loading y error se muestran en pantalla).
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Permite reintentar sin cambiar la URL (botón "Reintentar").
  const [retryKey, setRetryKey] = useState(0);

  // Cuando cambia la categoría de la URL (o el reintento), volvemos a estado de
  // carga. Se hace durante el render (patrón recomendado por React) en lugar de
  // dentro del effect, para no disparar renders en cascada.
  const requestKey = `${categoryFilter}#${retryKey}`;
  const [prevRequestKey, setPrevRequestKey] = useState(requestKey);

  if (prevRequestKey !== requestKey) {
    setPrevRequestKey(requestKey);
    setLoading(true);
    setError(null);
  }

  // Cargamos los productos cuando cambia la categoría de la URL (o el reintento).
  useEffect(() => {
    let cancelled = false; // Evita actualizar estado si el usuario cambió de filtro rápido.

    getProducts(categoryFilter)
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar los productos. Intentá de nuevo.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryFilter, retryKey]);

  // Al cambiar el select, actualizamos la query param (la URL queda compartible).
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = event.target.value;

    if (newCategory === "todas") {
      // Sin filtro: limpiamos la query param para no dejar "?category=todas" de más.
      setSearchParams({});
    } else {
      setSearchParams({ category: newCategory });
    }
  };

  return (
    <section className="page">
      <h1>Nuestros productos</h1>

      <div className="products__filter">
        <label htmlFor="category-filter">Filtrar por categoría:</label>
        <select
          id="category-filter"
          value={categoryFilter}
          onChange={handleCategoryChange}
          disabled={loading || error !== null}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "todas" ? "Todas" : category}
            </option>
          ))}
        </select>
      </div>

      {/* Estado de carga: visible mientras espera la API */}
      {loading && (
        <p className="status-message status-message--loading" role="status">
          Cargando productos...
        </p>
      )}

      {/* Estado de error: visible si falla la red o la API responde mal */}
      {!loading && error && (
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
      )}

      {/* Resultado normal */}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <p>No hay productos en la categoría "{categoryFilter}".</p>
          ) : (
            <div className="products__grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Products;
