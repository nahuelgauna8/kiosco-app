import { Link, NavLink } from "react-router-dom";

// Header global: logo + navegación con NavLink.
// El contador del carrito se conecta al CartContext en la Tarea 1.6.
function Header() {
  return (
    <header className="header">
      <Link to="/" className="header__logo">
        🏪 Kiosco El Rápido
      </Link>

      <nav className="header__nav">
        <NavLink to="/" end className="header__link">
          Inicio
        </NavLink>
        <NavLink to="/products" className="header__link">
          Productos
        </NavLink>
        <NavLink to="/cart" className="header__link">
          Carrito <span className="header__cart-count">(0)</span>
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
