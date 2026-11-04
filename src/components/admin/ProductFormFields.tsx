import { useState } from "react";
import type { Product } from "../../types";
import { CATEGORIES } from "../../data/categories";
import { Minus, Plus } from "lucide-react";

interface ProductFormFieldsProps {
  product?: Product;
  idPrefix: string;
}

// Campos compartidos de los formularios de productos (alta en /admin y
// edición inline en el catálogo). Formulario no controlado: los valores
// se leen con FormData al enviar (ver productForm.ts).
// Las características se manejan como una lista dinámica de inputs
// (agregar / quitar filas) en vez de un texto descriptivo libre.
function ProductFormFields({ product, idPrefix }: ProductFormFieldsProps) {
  const [features, setFeatures] = useState<string[]>(
    product?.description ?? [],
  );

  const addFeature = () => setFeatures([...features, ""]);

  const removeFeature = (index: number) => {
    const next = [...features];
    next.splice(index, 1);
    setFeatures(next);
  };

  const updateFeature = (index: number, value: string) => {
    const next = [...features];
    next[index] = value;
    setFeatures(next);
  };

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
              {category.label}
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
        <label htmlFor={`${idPrefix}-features`}>Características</label>
        <div className="features-list">
          {features.map((feature, index) => (
            <div key={index} className="feature-row">
              <input
                id={`${idPrefix}-feature-${index}`}
                name="description"
                type="text"
                value={feature}
                onChange={(event) => updateFeature(index, event.target.value)}
                placeholder="Ej: Sin azúcar"
              />
              <button
                type="button"
                className="button button--secondary feature-remove"
                onClick={() => removeFeature(index)}
                aria-label="Quitar característica"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="button button--secondary feature-add"
            onClick={addFeature}
          >
            <Plus size={16} aria-hidden="true" />
            Agregar característica
          </button>
          <p className="form-field__hint">
            Una característica por fila. Se guardan como lista del producto.
          </p>
        </div>
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
