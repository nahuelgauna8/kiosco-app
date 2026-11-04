// Utilidades para leer los formularios de productos (alta y edición).
// Los formularios son "no controlados": los datos se leen con FormData
// al enviar, así este módulo centraliza la conversión a payloads de la API.
import type { Category, Product, ProductInput } from "../../types";

// Lee FormData -> payload para POST/PUT /api/admin/products.
// Si el campo de URL de imagen está vacío, no se envía (no se toca la actual).
export function readProductForm(data: FormData): ProductInput {
  const imageUrl = String(data.get("image_url") ?? "").trim();

  return {
    name: String(data.get("name") ?? "").trim(),
    category: String(data.get("category") ?? "varios") as Category,
    price: Number(data.get("price")),
    stock: Number(data.get("stock")),
    description: String(data.get("description") ?? "").trim(),
    ...(imageUrl ? { image: imageUrl } : {}),
  };
}

// Devuelve el archivo elegido en el input type="file" (o null si no hay).
export function readProductImageFile(data: FormData): File | null {
  const file = data.get("image_file");
  return file instanceof File && file.size > 0 ? file : null;
}

// Mensaje de error listo para mostrar (ApiError u otro error inesperado).
export function formErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

// Texto del aviso de éxito al guardar un producto.
export function productSavedMessage(product: Product, created: boolean): string {
  return created
    ? `Producto "${product.name}" creado correctamente.`
    : `Producto "${product.name}" actualizado.`;
}
