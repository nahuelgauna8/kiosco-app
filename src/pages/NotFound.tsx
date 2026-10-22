import { Link } from "react-router-dom";

// Página 404: se muestra para cualquier ruta que no exista (ruta "*").
function NotFound() {
  return (
    <section className="page page--notfound">
      <h1>404</h1>
      <p>Ups... Esta página no existe o se la llevó el kiosquero. 🙈</p>
      <Link to="/" className="button button--primary">
        Volver al inicio
      </Link>
    </section>
  );
}

export default NotFound;
