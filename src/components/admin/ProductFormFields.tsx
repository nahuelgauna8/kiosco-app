import type { Product } from "../../types";
import { CATEGORIES } from "../../data/categories";

interface ProductFormFieldsProps {
  // Valores por defecto (edición). Sin producto = formulario de alta vacío.
  product?: Product;
  // Prefijo único para los ids de los inputs (evita duplicados si hay dos formularios).
  idPrefix: string;
}

// Campos compartidos de los formularios de productos (alta en /admin y
// edición inline en el catálogo). Formulario no controlado: los valores
// se leen con FormData al enviar (ver productForm.ts).
function ProductFormFields({ product, idPrefix }: ProductFormFieldsProps) {
  return (
    <>
      <div className="form-field">
        <label htmlFor={`${idPrefix}-name`}>Nombre</label>
        <input
          id={`${idPrefix}-name`}
          name="name"
          type="text"
          required
          maxLength={80}
          defaultValue={product?.name ?? ""}
          placeholder="Ej: Coca-Cola 500ml"
        />
      </div>

      <div className="form-field">
        <label htmlFor={`${idPrefix}-category`}>Categoría</label>
        <select
          id={`${idPrefix}-category`}
          name="category"
          defaultValue={product?.category ?? "bebidas"}
        >
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.emoji} {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field-row">
        <div className="form-field">
          <label htmlFor={`${idPrefix}-price`}>Precio ($)</label>
          <input
            id={`${idPrefix}-price`}
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            required
            defaultValue={product?.price ?? ""}
            placeholder="Ej: 1200"
          />
        </div>
        <div className="form-field">
          <label htmlFor={`${idPrefix}-stock`}>Stock</label>
          <input
            id={`${idPrefix}-stock`}
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.stock ?? 0}
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor={`${idPrefix}-description`}>Descripción</label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          rows={2}
          maxLength={200}
          defaultValue={product?.description ?? ""}
          placeholder="Opcional"
        />
      </div>

      <div className="form-field">
        <label htmlFor={`${idPrefix}-image-url`}>Imagen por URL (opcional)</label>
        <input
          id={`${idPrefix}-image-url`}
          name="image_url"
          type="text"
          defaultValue={product?.image ?? ""}
          placeholder="https://... o /uploads/products/..."
        />
        <p className="form-field__hint">
          Podés pegar el link de una imagen existente.
        </p>
      </div>

      <div className="form-field">
        <label htmlFor={`${idPrefix}-image-file`}>Elegir imagen (archivo, opcional)</label>
        <input
          id={`${idPrefix}-image-file`}
          name="image_file"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
        />
        <p className="form-field__hint">
          JPG, PNG, WEBP o GIF hasta 5 MB. Si elegís un archivo, se sube al
          servidor y tiene prioridad sobre la URL.
        </p>
      </div>
    </>
  );
}

export default ProductFormFields;
