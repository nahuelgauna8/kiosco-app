import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LoaderCircle, LockKeyhole, TriangleAlert } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { ApiError } from "../../services/api";

// Pantalla de ingreso de administrador (clave de acceso, sin usuario).
// Se muestra en /admin mientras no haya sesión activa.
function AdminLogin() {
  const { login } = useAdmin();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const password = String(
      new FormData(event.currentTarget).get("password") ?? "",
    ).trim();
    if (!password) return;

    setSubmitting(true);
    setError(null);

    try {
      await login(password);
      // Si llegó hasta acá, AdminContext guardó el token y el gate de /admin
      // reemplaza este formulario por el panel.
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo iniciar sesión. Intentá de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page admin-login">
      <h1>
        <LockKeyhole size={26} strokeWidth={2.25} aria-hidden="true" />
        Ingreso administrador
      </h1>
      <p className="admin-login__hint">
        Ingresá la clave de acceso del kiosco.
      </p>

      <form className="admin-login__form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="admin-password">Clave de acceso</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            <TriangleAlert size={16} aria-hidden="true" />
            {error}
          </p>
        )}

        <button
          type="submit"
          className="button button--primary"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <LoaderCircle
                className="status-message__spinner"
                size={16}
                aria-hidden="true"
              />
              Verificando...
            </>
          ) : (
            <>
              <LockKeyhole size={16} aria-hidden="true" />
              Ingresar
            </>
          )}
        </button>
      </form>

      <Link to="/" className="button button--secondary">
        <ArrowLeft size={16} aria-hidden="true" />
        Volver al inicio
      </Link>
    </section>
  );
}

export default AdminLogin;
