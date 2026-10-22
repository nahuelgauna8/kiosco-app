import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

// Header global: logo + navegación con NavLink.
// El contador muestra la cantidad total de unidades del carrito (CartContext).
function Header() {
  const { totalItems } = useCart();

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
          Carrito <span className="header__cart-count">({totalItems})</span>
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
