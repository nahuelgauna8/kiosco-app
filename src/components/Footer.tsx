import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

// Footer global que se muestra en todas las páginas (dentro del Layout).
// Incluye el link discreto "Ajustes" que abre el panel de administración
// (también se puede entrar escribiendo /admin en la URL).
function Footer() {
  return (
    <footer className="footer">
      <p>Kiosco El Rápido – 2026</p>
      <Link to="/admin" className="footer__admin-link">
        <Settings size={14} aria-hidden="true" />
        Ajustes
      </Link>
    </footer>
  );
}

export default Footer;
