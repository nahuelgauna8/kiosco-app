import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Cookie, CupSoda, Popcorn, Store } from "lucide-react";

// Página de presentación: exclusivamente bienvenida + llamado a la acción.
// (No se muestran productos acá: el catálogo vive en /products).
function Home() {
  // Imagen del banner (se agrega al final del proyecto):
  //   public/images/banner-home.jpg
  // Si todavía no existe, se muestra el fondo de respaldo (gradiente cálido
  // con iconos vectoriales del kiosco).
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
          <Store size={64} strokeWidth={1.5} />
          <CupSoda size={64} strokeWidth={1.5} />
          <Popcorn size={64} strokeWidth={1.5} />
          <Cookie size={64} strokeWidth={1.5} />
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
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export default Home;
