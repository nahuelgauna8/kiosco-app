import { useRef, useState, type FormEvent } from "react";
import { Pencil, TriangleAlert } from "lucide-react";
import Modal from "../Modal";
import ProductFormFields from "./ProductFormFields";
import {
  formErrorMessage,
  readProductForm,
  readProductImageFile,
} from "./productForm";
import { adminUpdateProduct, adminUploadProductImage } from "../../services/api";
import type { Product } from "../../types";

interface ProductEditDialogProps {
  product: Product;
  // Se llama con el producto ya actualizado (el catálogo refresca la tarjeta).
  onSaved: (updated: Product) => void;
  onClose: () => void;
}

// Diálogo de edición rápida de un producto desde el catálogo (modo admin).
// Usa los mismos campos que el alta; si se elige un archivo de imagen,
// primero guarda los datos y después sube la foto.
function ProductEditDialog({ product, onSaved, onClose }: ProductEditDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Foco inicial en "Cancelar" (la opción segura, igual que ConfirmDialog).
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);

    try {
      let updated = await adminUpdateProduct(product.id, readProductForm(data));

      const file = readProductImageFile(data);
      if (file) {
        updated = await adminUploadProductImage(updated.id, file);
      }

      onSaved(updated);
    } catch (err: unknown) {
      setError(formErrorMessage(err, "No se pudieron guardar los cambios."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      titleId="product-edit-title"
      messageId="product-edit-hint"
      initialFocusRef={cancelRef}
      busy={submitting}
      onClose={onClose}
    >
      <form className="product-form" onSubmit={handleSubmit}>
        <h2 className="modal__title" id="product-edit-title">
          <Pencil size={20} aria-hidden="true" />
          Editar producto
        </h2>
        <p className="modal__subtitle" id="product-edit-hint">
          Modificá los campos que quieras y guardá los cambios.
        </p>

        <ProductFormFields product={product} idPrefix="edit" />

        {error && (
          <p className="form-error" role="alert">
            <TriangleAlert size={16} aria-hidden="true" />
            {error}
          </p>
        )}

        <div className="modal__actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={onClose}
            disabled={submitting}
            ref={cancelRef}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="button button--primary"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductEditDialog;
