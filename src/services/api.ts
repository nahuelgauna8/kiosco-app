// Servicio de API: centraliza todas las llamadas al backend (FastAPI).
//
// El backend debe estar corriendo en http://localhost:8000
// (uvicorn main:app --reload, desde la carpeta backend/).
//
// Todos los errores (red caída, timeout, 4xx/5xx de la API) se lanzan como
// ApiError con un mensaje apto para mostrarle al usuario en pantalla.
import type {
  AdminSession,
  AdminStats,
  Order,
  OrderItemInput,
  Product,
  ProductInput,
} from "../types";
import { loadAdminSession } from "./adminSession";

const API_BASE = "http://localhost:8000/api";
// Origen del backend (sin /api): sirve para resolver rutas de imágenes
// guardadas como "/uploads/products/x.png".
const API_ORIGIN = API_BASE.replace(/\/api$/, "");

// Resuelve la imagen de un producto: las rutas relativas ("/uploads/...")
// se apuntan al backend; las URLs externas y los emojis quedan igual.
export function resolveImageUrl(image?: string | null): string | undefined {
  if (!image) return undefined;
  return image.startsWith("/") ? `${API_ORIGIN}${image}` : image;
}

// Error de la API: lleva el mensaje visible y el código HTTP (0 = error de red).
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Extrae un mensaje legible del body de error de FastAPI.
// FastAPI responde {"detail": "..."} y Pydantic (422) {"detail": [{msg: "..."}, ...]}.
function extractDetail(data: unknown): string | null {
  if (typeof data !== "object" || data === null || !("detail" in data)) {
    return null;
  }

  const detail = (data as { detail: unknown }).detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) =>
        typeof item === "object" && item !== null && "msg" in item
          ? (item as { msg: unknown }).msg
          : null,
      )
      .filter((msg): msg is string => typeof msg === "string");

    if (messages.length > 0) {
      return messages.join(" / ");
    }
  }

  return null;
}

// Fetch genérico con manejo de errores centralizado.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  // FormData: el navegador pone el Content-Type con su boundary, no lo
  // pisamos con "application/json".
  const isFormData = options.body instanceof FormData;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  } catch (error) {
    // Servidor caído, sin conexión o bloqueo de CORS: cualquier fetch rechazado.
    throw new ApiError(
      "No se pudo conectar con el servidor. Verificá que el backend esté corriendo.",
      0,
    );
  }

  if (!response.ok) {
    let message = `El servidor respondió con un error (${response.status}).`;

    try {
      const data: unknown = await response.json();
      message = extractDetail(data) ?? message;
    } catch {
      // El body no era JSON: dejamos el mensaje genérico.
    }

    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

// ===== Endpoints de productos =====

// GET /api/products?category=bebidas (filtro opcional)
export async function getProducts(category?: string): Promise<Product[]> {
  const query =
    category && category !== "todas"
      ? `?category=${encodeURIComponent(category)}`
      : "";

  return request<Product[]>(`/products${query}`);
}

// GET /api/products/{id} (lanza ApiError 404 si no existe)
export async function getProductById(id: number): Promise<Product> {
  return request<Product>(`/products/${id}`);
}

// ===== Endpoints de pedidos =====

// POST /api/orders (valida stock en el backend y lo descuenta)
export async function createOrder(
  items: OrderItemInput[],
  data?: {
    customer_name: string;
    delivery_method: string;
    delivery_address?: string;
    delivery_name?: string;
    payment_method: string;
  },
): Promise<Order> {
  return request<Order>(`/orders`, {
    method: "POST",
    body: JSON.stringify({ items, ...data }),
  });
}

// GET /api/orders (lista de pedidos, del más reciente al más antiguo)
export async function getOrders(): Promise<Order[]> {
  return request<Order[]>("/orders");
}

// DELETE /api/orders (borra todo el historial; no modifica el stock)
export async function deleteOrders(): Promise<number> {
  const result = await request<{ deleted: number }>(`/orders`, {
    method: "DELETE",
  });
  return result.deleted;
}

// ===== Endpoints de administración =====

// Fetch con el token de admin en el header Authorization.
// Si no hay sesión (o el backend responde 401), lanza ApiError 401:
// las páginas admin reaccionan cerrando la sesión y mostrando el login.
async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = loadAdminSession();
  if (!token) {
    throw new ApiError(
      "Tu sesión de administrador expiró. Ingresá nuevamente.",
      401,
    );
  }

  return request<T>(path, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });
}

// POST /api/admin/login (clave incorrecta -> ApiError 401)
export async function adminLogin(password: string): Promise<AdminSession> {
  return request<AdminSession>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

// GET /api/admin/me: verifica contra el backend que la sesión siga válida
export async function adminValidateSession(): Promise<void> {
  await adminRequest("/admin/me");
}

// GET /api/admin/stats (dashboard: pedidos del día, ingresos, stock bajo)
export async function adminGetStats(): Promise<AdminStats> {
  return adminRequest<AdminStats>("/admin/stats");
}

// POST /api/admin/products (alta de producto)
export async function adminCreateProduct(data: ProductInput): Promise<Product> {
  return adminRequest<Product>("/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT /api/admin/products/{id} (edición parcial: solo los campos enviados)
export async function adminUpdateProduct(
  id: number,
  data: Partial<ProductInput>,
): Promise<Product> {
  return adminRequest<Product>(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// POST /api/admin/products/{id}/stock (suma unidades al stock actual)
export async function adminRestockProduct(
  id: number,
  quantity: number,
): Promise<Product> {
  return adminRequest<Product>(`/admin/products/${id}/stock`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });
}

// DELETE /api/admin/products/{id} (devuelve el id borrado)
export async function adminDeleteProduct(id: number): Promise<number> {
  const result = await adminRequest<{ deleted: number }>(`/admin/products/${id}`, {
    method: "DELETE",
  });
  return result.deleted;
}

// POST /api/admin/products/{id}/image (multipart: un archivo, máx. 5 MB)
export async function adminUploadProductImage(
  id: number,
  file: File,
): Promise<Product> {
  const form = new FormData();
  form.append("file", file);
  return adminRequest<Product>(`/admin/products/${id}/image`, {
    method: "POST",
    body: form,
  });
}
