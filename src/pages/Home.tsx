import { Link } from "react-router-dom";

// Página de bienvenida con acceso rápido al catálogo.
// (Se pulirá más en la Tarea 1.5)
function Home() {
  return (
    <section className="page page--home">
      <h1>¡Bienvenido a Kiosco El Rápido! 🏪</h1>
      <p>
        Bebidas, snacks, golosinas y más, al toque y a un paso de tu casa.
      </p>
      <Link to="/products" className="button button--primary button--big">
        Ver catálogo →
      </Link>
    </section>
  );
}

export default Home;
