import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import type { Category } from "../types";

// Categorías disponibles para el filtro.
const categories: Array<Category | "todas"> = [
  "todas",
  "bebidas",
  "snacks",
  "golosinas",
  "varios",
];

// Página de listado de productos.
// El filtro por categoría se guarda en la URL: /products?category=bebidas
function Products() {
  // useSearchParams reemplaza a useState para lo que vive en la query string:
  // [searchParams] = estado actual de la URL, setSearchParams = actualizar la URL.
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFilter = searchParams.get("category") ?? "todas";

  // Filtramos los productos según el query param de la URL.
  const filteredProducts =
    categoryFilter === "todas"
      ? products
      : products.filter((product) => product.category === categoryFilter);

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
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "todas" ? "Todas" : category}
            </option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p>No hay productos en la categoría "{categoryFilter}".</p>
      ) : (
        <div className="products__grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Products;
