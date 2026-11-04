import { Link } from "react-router-dom";
import { CATEGORIES } from "../data/categories";

// Barra horizontal de categorías (solo en el Home, como en la referencia).
// Muestra el icono vectorial de cada categoría junto a su etiqueta.
function CategoryBar() {
  return (
    <nav className="category-bar" aria-label="Categorías destacadas">
      {CATEGORIES.map((category) => (
        <Link
          key={category.id}
          to={`/products?category=${category.id}`}
          className="category-bar__link"
        >
          <category.icon size={16} strokeWidth={2.25} aria-hidden="true" />
          {category.label}
        </Link>
      ))}
    </nav>
  );
}

export default CategoryBar;
