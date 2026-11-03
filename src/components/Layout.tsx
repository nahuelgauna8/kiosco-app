import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CategoryBar from "./CategoryBar";

// Layout global: Header (+ barra de categorías solo en el Home) + Footer.
// Las páginas se renderizan dentro de <Outlet />.
// (El panel lateral del carrito - CartDrawer - se suma en el commit R.3.)
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
    </div>
  );
}

export default Layout;
