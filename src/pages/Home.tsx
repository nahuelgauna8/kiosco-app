import { Link } from "react-router-dom";

// Página de bienvenida con accesos rápidos al catálogo.
function Home() {
  return (
    <section className="page page--home">
      <h1>¡Bienvenido a Kiosco El Rápido! 🏪</h1>
      <p>
        Bebidas, snacks, golosinas y más, al toque y a un paso de tu casa.
      </p>

      <Link to="/products" className="button button--primary button--big">
        Ver catálogo completo →
      </Link>

      {/* Accesos rápidos por categoría: usan el mismo query param
          que el filtro de la página Products (?category=...) */}
      <nav className="home__categories" aria-label="Categorías destacadas">
        <Link to="/products?category=bebidas" className="home__category-link">
          🥤 Bebidas
        </Link>
        <Link to="/products?category=snacks" className="home__category-link">
          🍟 Snacks
        </Link>
        <Link to="/products?category=golosinas" className="home__category-link">
          🍪 Golosinas
        </Link>
        <Link to="/products?category=varios" className="home__category-link">
          🔥 Varios
        </Link>
      </nav>
    </section>
  );
}

export default Home;
