import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CategoryBar from "./CategoryBar";
import CartDrawer from "./CartDrawer";

// Layout global: Header (+ barra de categorías solo en el Home) + Footer.
// Las páginas se renderizan dentro de <Outlet />.
// CartDrawer vive acá para que el panel se pueda abrir desde cualquier ruta.
function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="layout">
      <Header />
      {pathname === "/" && <CategoryBar />}
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export default Layout;
