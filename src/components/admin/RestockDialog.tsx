import { useRef, useState, type FormEvent } from "react";
import Modal from "../Modal";
import { formErrorMessage } from "./productForm";
import { adminRestockProduct } from "../../services/api";
import type { Product } from "../../types";

interface RestockDialogProps {
  product: Product;
  // Se llama con el producto ya repuesto (el catálogo refresca la tarjeta).
  onSaved: (updated: Product) => void;
  onClose: () => void;
}

// Diálogo de reposición de stock desde el catálogo (modo admin):
// suma las unidades indicadas al stock actual (POST .../stock).
function RestockDialog({ product, onSaved, onClose }: RestockDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // El foco inicial va al campo de cantidad (es lo único a completar).
  const quantityRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const quantity = Number(
      new FormData(event.currentTarget).get("quantity") ?? 0,
    );
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Ingresá una cantidad válida (al menos 1 unidad).");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated = await adminRestockProduct(product.id, quantity);
      onSaved(updated);
    } catch (err: unknown) {
      setError(formErrorMessage(err, "No se pudo reponer el stock."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      titleId="product-restock-title"
      initialFocusRef={quantityRef}
      busy={submitting}
      onClose={onClose}
    >
      <form className="product-form" onSubmit={handleSubmit}>
        <h2 className="modal__title" id="product-restock-title">
          📦 Reponer stock
        </h2>
        <p className="modal__subtitle">
          <strong>{product.name}</strong> — stock actual:{" "}
          <strong>{product.stock}</strong>
        </p>

        <div className="form-field">
          <label htmlFor="restock-quantity">Unidades a sumar</label>
          <input
            id="restock-quantity"
            name="quantity"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={1}
            ref={quantityRef}
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="modal__actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="button button--primary"
            disabled={submitting}
          >
            {submitting ? "Reponiendo..." : "Reponer stock"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default RestockDialog;
