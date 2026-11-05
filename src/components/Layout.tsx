import { useEffect, useRef } from "react";
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
  const prevPathnameRef = useRef<string | null>(null);

  // Evita que el navegador restaure el scroll por su cuenta y choque con
  // nuestra restauración guardada en sessionStorage.
  useEffect(() => {
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = "auto";
    };
  }, []);

  // Conserva la posición de scroll del catálogo al salir de /products y la
  // restaura al volver, para que no tenga que bajar de nuevo hasta el producto
  // que estaba viendo.
  useEffect(() => {
    const isProductsIndex = pathname === "/products";
    const wasProductsIndex = prevPathnameRef.current === "/products";

    // Salimos del catálogo (entramos a un detalle u otra ruta): guardamos el scroll actual.
    if (wasProductsIndex && !isProductsIndex) {
      sessionStorage.setItem("kiosco:scroll:/products", String(window.scrollY));
    }

    // Entramos al catálogo desde otra ruta: restauramos el scroll guardado.
    if (isProductsIndex && !wasProductsIndex) {
      const saved = sessionStorage.getItem("kiosco:scroll:/products");
      if (saved !== null) {
        const y = Number(saved);
        // requestAnimationFrame espera a que React termine de renderizar
        // la lista de productos antes de aplicar el scroll.
        const raf = requestAnimationFrame(() => {
          window.scrollTo(0, y);
        });
        return () => cancelAnimationFrame(raf);
      }
    }

    prevPathnameRef.current = pathname;
  }, [pathname]);

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
