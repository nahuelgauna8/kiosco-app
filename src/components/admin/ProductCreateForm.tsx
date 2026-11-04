import { type FormEvent, useState } from "react";
import ProductFormFields from "./ProductFormFields";
import {
  formErrorMessage,
  productSavedMessage,
  readProductForm,
  readProductImageFile,
} from "./productForm";
import {
  adminCreateProduct,
  adminUploadProductImage,
} from "../../services/api";

interface ProductCreateFormProps {
  // Se llama después de crear (para refrescar el resumen del dashboard).
  onCreated: () => void;
}

// Formulario de alta de productos en /admin: datos + imagen (URL o archivo).
// Si se eligió archivo, primero crea el producto y después sube la imagen.
function ProductCreateForm({ onCreated }: ProductCreateFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    setSubmitting(true);
    setNotice(null);
    setError(null);

    try {
      const created = await adminCreateProduct(readProductForm(data));

      // Imagen por archivo: se sube después de crear (necesita el id).
      const file = readProductImageFile(data);
      let uploadError: string | null = null;
      if (file) {
        try {
          await adminUploadProductImage(created.id, file);
        } catch (err: unknown) {
          uploadError = `El producto se creó, pero falló la subida de la imagen: ${formErrorMessage(err, "error inesperado")}`;
        }
      }

      form.reset(); // Los campos no controlados vuelven a sus defaultValue.
      onCreated(); // Refresca el dashboard (nuevo producto / stock).

      if (uploadError) setError(uploadError);
      else setNotice(productSavedMessage(created, true));
    } catch (err: unknown) {
      setError(
        formErrorMessage(err, "No se pudo crear el producto. Intentá de nuevo."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <ProductFormFields idPrefix="create" />

      {notice && (
        <p className="form-success" role="status">
          ✅ {notice}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="product-form__actions">
        <button
          type="submit"
          className="button button--primary"
          disabled={submitting}
        >
          {submitting ? "Guardando..." : "➕ Agregar producto"}
        </button>
      </div>
    </form>
  );
}

export default ProductCreateForm;
