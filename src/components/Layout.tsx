import { useEffect, useState } from "react";
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
  const [isDark, setIsDark] = useState<boolean>(false);

  // Lee la preferencia guardada en localStorage (o el sistema) al montar.
  useEffect(() => {
    const saved = localStorage.getItem("kiosco:theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && systemDark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setIsDark(dark);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    localStorage.setItem("kiosco:theme", next ? "dark" : "light");
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setIsDark(next);
  };

  return (
    <div className="layout">
      <Header isDark={isDark} toggleDark={toggleDark} />
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
