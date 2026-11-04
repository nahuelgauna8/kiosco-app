import { useAdmin } from "../context/AdminContext";
import AdminLogin from "../components/admin/AdminLogin";
import AdminPanel from "../components/admin/AdminPanel";

// Página /admin: la "puerta" del panel de administración.
// - Sin sesión válida -> formulario de ingreso (clave de acceso).
// - Con sesión -> panel de administración (dashboard + carga de productos).
// El link discreto está en el footer ("Ajustes") y también se puede
// escribir la URL directamente (localhost:5173/admin).
function Admin() {
  const { isAdmin } = useAdmin();

  return isAdmin ? <AdminPanel /> : <AdminLogin />;
}

export default Admin;
