import { useAdmin } from "../../context/AdminContext";

// Panel de administración (vista central en /admin).
// En la próxima etapa se cargan el dashboard y el formulario de alta
// de productos; por ahora confirma que la sesión está activa.
function AdminPanel() {
  const { logout } = useAdmin();

  return (
    <section className="page admin-panel">
      <h1>🔧 Panel de administración</h1>
      <p>Sesión activa. Desde el catálogo también podés editar productos.</p>
      <button type="button" className="button button--secondary" onClick={logout}>
        Cerrar sesión
      </button>
    </section>
  );
}

export default AdminPanel;
