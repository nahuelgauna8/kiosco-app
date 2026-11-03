import { type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CATEGORIES } from "../data/categories";

// Header global: logo + barra de búsqueda + navegación + botón del carrito.
// La búsqueda lleva a /products?search=... (el catálogo filtra por nombre).
function Header() {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  // El valor inicial del input se deriva de la URL (sin useEffect).
  // La clave "key" hace que el input se remonte cuando cambia la URL,
  // de modo que siempre refleja lo que dice ?search=... (o vacío).
  const searchTerm =
    pathname === "/products"
      ? new URLSearchParams(search).get("search") ?? ""
      : "";

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const term = String(data.get("search") ?? "").trim();
    // La búsqueda reemplaza los filtros: busca en todo el catálogo.
    navigate(term ? `/products?search=${encodeURIComponent(term)}` : "/products");
  };

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          🏪 Kiosco El Rápido
        </Link>

        <form className="header__search" onSubmit={handleSearch} role="search">
          <input
            type="search"
            name="search"
            key={searchTerm}
            defaultValue={searchTerm}
            placeholder="¿Qué estás buscando?"
            aria-label="Buscar productos"
          />
          <button type="submit" aria-label="Buscar">
            🔍
          </button>
        </form>

        <nav className="header__nav" aria-label="Navegación principal">
          <NavLink to="/" end className="header__link">
            Inicio
          </NavLink>
          <NavLink to="/products" className="header__link">
            Productos
          </NavLink>

          <div className="header__dropdown">
            <button
              type="button"
              className="header__link header__dropdown-toggle"
            >
              Categorías <span aria-hidden="true">▾</span>
            </button>
            <div className="header__dropdown-menu">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="header__dropdown-item"
                >
                  <span aria-hidden="true">{category.emoji}</span> {category.label}
                </Link>
              ))}
            </div>
          </div>

          {/* En la Tarea R.3 este link se reemplaza por un botón
              que abre el panel lateral (drawer) del carrito. */}
          <NavLink to="/cart" className="header__link header__cart-link">
            Carrito ({totalItems})
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
