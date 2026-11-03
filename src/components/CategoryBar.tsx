import { Link } from "react-router-dom";
import { CATEGORIES } from "../data/categories";

// Barra horizontal de categorías (solo en el Home, como en la referencia).
function CategoryBar() {
  return (
    <nav className="category-bar" aria-label="Categorías destacadas">
      {CATEGORIES.map((category) => (
        <Link
          key={category.id}
          to={`/products?category=${category.id}`}
          className="category-bar__link"
        >
          {category.label}
        </Link>
      ))}
    </nav>
  );
}

export default CategoryBar;
