import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ConfirmDialog from "../components/ConfirmDialog";
import ProductEditDialog from "../components/admin/ProductEditDialog";
import RestockDialog from "../components/admin/RestockDialog";
import { CATEGORIES } from "../data/categories";
import type { Product } from "../types";
import { ApiError, adminDeleteProduct, getProducts } from "../services/api";
import { useAdmin } from "../context/AdminContext";

// Opciones de ordenamiento de la barra superior.
const sortOptions = [
  { value: "destacados", label: "Destacados" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre (A-Z)" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

// Página de catálogo: sidebar de categorías + barra de ordenamiento + grilla.
// Carga los datos desde el backend (GET /api/products) y filtra con query params:
//   /products?category=bebidas
//   /products?search=coca        (búsqueda por nombre, se aplica en el cliente)
// El ordenamiento es local (no cambia la URL).
function Products() {
  // useSearchParams reemplaza a useState para lo que vive en la query string:
  // [searchParams] = estado actual de la URL, setSearchParams = actualizar la URL.
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFilter = searchParams.get("category") ?? "todas";
  const searchTerm = (searchParams.get("search") ?? "").trim().toLowerCase();

  // Estados de la petición a la API (loading y error se muestran en pantalla).
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Permite reintentar sin cambiar la URL (botón "Reintentar").
  const [retryKey, setRetryKey] = useState(0);

  // Ordenamiento elegido en la barra superior (estado local).
  const [sort, setSort] = useState<SortOption>("destacados");

  // Modo administrador: con sesión activa se desbloquean las acciones
  // inline de las tarjetas (editar / reponer / eliminar).
  const { isAdmin } = useAdmin();
  const [editing, setEditing] = useState<Product | null>(null);
  const [restocking, setRestocking] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

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

  // Búsqueda por nombre + ordenamiento: se aplican sobre los datos ya cargados.
  const visibleProducts = useMemo(() => {
    let list = [...products];

    if (searchTerm) {
      list = list.filter((product) =>
        product.name.toLowerCase().includes(searchTerm),
      );
    }

    switch (sort) {
      case "precio-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "precio-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "nombre":
        list.sort((a, b) => a.name.localeCompare(b.name, "es"));
        break;
      default:
        // "destacados": conserva el orden que devuelve el backend.
        break;
    }

    return list;
  }, [products, searchTerm, sort]);

  // Click en una categoría del sidebar: actualiza la query param.
  // La búsqueda se limpia al elegir categoría (y viceversa) para que los dos
  // modos no se pisen: o browseás por categoría o buscás por nombre.
  const selectCategory = (categoryId: string) => {
    setSearchParams(categoryId === "todas" ? {} : { category: categoryId });
  };

  // ===== Acciones de administración (inline en el catálogo) =====

  // Refresca la tarjeta de un producto guardado (editar o reponer).
  const handleProductSaved = (updated: Product) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    setEditing(null);
    setRestocking(null);
    setAdminError(null);
    setAdminNotice(`Producto "${updated.name}" actualizado correctamente.`);
  };

  // Abre el diálogo de eliminar con confirmación (no borra de una).
  const handleDeleteRequest = (product: Product) => {
    setAdminNotice(null);
    setAdminError(null);
    setDeleting(product);
  };

  // Confirma y ejecuta la eliminación desde el ConfirmDialog.
  const handleConfirmDelete = async () => {
    if (!deleting) return;

    setDeletingBusy(true);
    setAdminError(null);

    try {
      await adminDeleteProduct(deleting.id);
      setProducts((prev) => prev.filter((item) => item.id !== deleting.id));
      setAdminNotice(`Producto "${deleting.name}" eliminado del catálogo.`);
      setDeleting(null);
    } catch (err: unknown) {
      setDeleting(null);
      setAdminError(
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar el producto. Intentá de nuevo.",
      );
    } finally {
      setDeletingBusy(false);
    }
  };

  // Se pasan a las tarjetas solo en modo admin (si no, no se renderizan).
  const adminActions = isAdmin
    ? {
        onEdit: (product: Product) => {
          setAdminNotice(null);
          setAdminError(null);
          setEditing(product);
        },
        onRestock: (product: Product) => {
          setAdminNotice(null);
          setAdminError(null);
          setRestocking(product);
        },
        onDelete: handleDeleteRequest,
      }
    : undefined;

  return (
    <div className="products-layout">
      {/* ===== Panel lateral: filtros de categorías ===== */}
      <aside className="products__sidebar">
        <h2>Categorías</h2>
        <ul className="products__category-list">
          <li>
            <button
              type="button"
              className={`products__category-link ${
                categoryFilter === "todas" ? "is-active" : ""
              }`}
              onClick={() => selectCategory("todas")}
            >
              <span aria-hidden="true">🛒</span> Todas
            </button>
          </li>
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                className={`products__category-link ${
                  categoryFilter === category.id ? "is-active" : ""
                }`}
                onClick={() => selectCategory(category.id)}
              >
                <span aria-hidden="true">{category.emoji}</span> {category.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ===== Contenido: barra superior + grilla ===== */}
      <div className="products__content">
        <div className="products__topbar">
          <h1>Nuestros productos</h1>

          <div className="products__sort">
            <label htmlFor="sort-products">Ordenar por:</label>
            <select
              id="sort-products"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              disabled={loading || error !== null}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Avisos de las acciones de administración (éxito o error) */}
        {adminNotice && (
          <div className="products__admin-notice" role="status">
            <span>✅ {adminNotice}</span>
            <button
              type="button"
              onClick={() => setAdminNotice(null)}
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
          </div>
        )}
        {adminError && (
          <p className="form-error" role="alert">
            ⚠️ {adminError}
          </p>
        )}

        {/* Chip de búsqueda activa (entra desde la barra del header) */}
        {searchTerm && !loading && !error && (
          <div className="products__search-info">
            <span>
              Resultados para <strong>"{searchTerm}"</strong> ({visibleProducts.length})
            </span>
            <button
              type="button"
              className="products__search-clear"
              onClick={() => setSearchParams({})}
            >
              ✕ Limpiar búsqueda
            </button>
          </div>
        )}

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
            {visibleProducts.length === 0 ? (
              <p className="products__empty">
                {searchTerm
                  ? `No encontramos productos que coincidan con "${searchTerm}".`
                  : `No hay productos en la categoría "${categoryFilter}".`}
              </p>
            ) : (
              <div className="products__grid">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    adminActions={adminActions}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Atajo al carrito / inicio cuando no hay resultados */}
        {!loading && !error && visibleProducts.length === 0 && (
          <Link to="/" className="button button--secondary">
            ← Volver al inicio
          </Link>
        )}
      </div>

      {/* ===== Diálogos de administración (solo en modo admin) ===== */}
      {editing && (
        <ProductEditDialog
          product={editing}
          onSaved={handleProductSaved}
          onClose={() => setEditing(null)}
        />
      )}

      {restocking && (
        <RestockDialog
          product={restocking}
          onSaved={handleProductSaved}
          onClose={() => setRestocking(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          open
          title="¿Eliminar producto?"
          message={`Se eliminará "${deleting.name}" del catálogo. Los pedidos históricos no se modifican.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          busy={deletingBusy}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

export default Products;
