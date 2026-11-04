import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import TrustBadges from "../components/TrustBadges";

// Página de presentación: exclusivamente bienvenida + llamado a la acción.
// (No se muestran productos acá: el catálogo vive en /products).
//
// El hero es una tarjeta flotante centrada con degradado cálido
// (naranja → ámbar) y dos columnas:
//   - Izquierda: mensaje de bienvenida + botón "Explorar Productos".
//   - Derecha: badges de confianza en glassmorphism (ver TrustBadges).
// Responsive: 1 columna en móvil, 2 columnas en desktop (≥900px).
function Home() {
  return (
    <section className="hero">
      <div className="hero__card">
        {/* ===== Columna izquierda: mensaje ===== */}
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

        {/* ===== Columna derecha: badges de confianza ===== */}
        <TrustBadges />
      </div>
    </section>
  );
}

export default Home;
