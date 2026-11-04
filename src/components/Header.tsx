import { type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  LogOut,
  Package,
  Receipt,
  Search,
  ShoppingCart,
  Settings,
  Store,
  Wrench,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAdmin } from "../context/AdminContext";

// Header global: logo + barra de búsqueda + navegación + botón del carrito.
// La búsqueda lleva a /products?search=... (el catálogo filtra por nombre).
function Header() {
  const { totalItems, openCart } = useCart();
  const { isAdmin, logout } = useAdmin();
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
          <Store size={22} strokeWidth={2.25} aria-hidden="true" />
          Kiosco El Rápido
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
            <Search size={18} aria-hidden="true" />
          </button>
        </form>

        <nav className="header__nav" aria-label="Navegación principal">
          <NavLink to="/" end className="header__link">
            <House size={17} aria-hidden="true" />
            Inicio
          </NavLink>
          <NavLink to="/products" className="header__link">
            <Package size={17} aria-hidden="true" />
            Productos
          </NavLink>
          <NavLink to="/orders" className="header__link">
            <Receipt size={17} aria-hidden="true" />
            Mis pedidos
          </NavLink>

          {/* Sesión de administrador activa: enlace al panel principal + cierre de sesión */}
          {isAdmin && (
            <>
              <Link
                to="/admin"
                className="header__admin-badge"
                title="Ir al panel de administración"
              >
                <Wrench size={14} aria-hidden="true" />
                Modo admin
              </Link>
              <button
                type="button"
                className="header__link"
                onClick={logout}
              >
                <LogOut size={16} aria-hidden="true" />
                Cerrar sesión
              </button>
            </>
          )}

          {/* Abre el panel lateral (drawer) del carrito, sin navegar de ruta. */}
          <button
            type="button"
            className="header__link header__cart-link"
            onClick={openCart}
            aria-label="Abrir el carrito"
          >
            <ShoppingCart size={18} aria-hidden="true" />
            Carrito <span className="header__cart-count">({totalItems})</span>
          </button>

          {/* Icono de ajustes: solo visible para clientes / sin sesión de admin.
               Se oculta cuando el administrador está logueado (ya ve "Modo admin" y
               "Cerrar sesión"). Redirige a la sección de configuración. */}
          {!isAdmin && (
            <Link
              to="/admin/settings"
              className="header__settings-link"
              title="Ajustes"
              aria-label="Ajustes"
            >
              <Settings size={17} aria-hidden="true" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
