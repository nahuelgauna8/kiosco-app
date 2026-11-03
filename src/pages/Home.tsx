import { useState } from "react";
import { Link } from "react-router-dom";

// Página de presentación: exclusivamente bienvenida + llamado a la acción.
// (No se muestran productos acá: el catálogo vive en /products).
function Home() {
  // Imagen del banner (se agrega al final del proyecto):
  //   public/images/banner-home.jpg
  // Si todavía no existe, se muestra el fondo de respaldo (gradiente cálido).
  const [bannerOk, setBannerOk] = useState(true);

  return (
    <section className="hero">
      {bannerOk && (
        <img
          className="hero__img"
          src="/images/banner-home.jpg"
          alt=""
          onError={() => setBannerOk(false)}
        />
      )}

      {!bannerOk && (
        <div className="hero__fallback" aria-hidden="true">
          🏪 🥤 🍟 🍪
        </div>
      )}

      <div className="hero__overlay" />

      <div className="hero__content">
        <h1 className="hero__title">
          ¡Bienvenidos a tu <span>Kiosco El Rápido!</span>
        </h1>
        <p className="hero__subtitle">
          Encontrá tus productos al toque.
          <br />
          A pasos de tu casa, las 24hs.
        </p>
        <Link to="/products" className="button button--light button--big">
          Explorar Productos
        </Link>
      </div>
    </section>
  );
}

export default Home;
