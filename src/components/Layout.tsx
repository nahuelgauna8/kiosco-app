import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

// Layout global: Header + Footer en todas las rutas.
// Las páginas se renderizan dentro de <Outlet />.
function Layout() {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
