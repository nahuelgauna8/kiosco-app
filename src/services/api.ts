// Servicio de API: centraliza todas las llamadas al backend (FastAPI).
//
// El backend debe estar corriendo en http://localhost:8000
// (uvicorn main:app --reload, desde la carpeta backend/).
//
// Todos los errores (red caída, timeout, 4xx/5xx de la API) se lanzan como
// ApiError con un mensaje apto para mostrarle al usuario en pantalla.
import type { Order, OrderItemInput, Product } from "../types";

const API_BASE = "http://localhost:8000/api";

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

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
      // Si el backend no responde en 8 segundos, se corta (timeout visible).
      signal: options.signal ?? AbortSignal.timeout(8000),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError(
        "El servidor tardó demasiado en responder. Intentá de nuevo.",
        0,
      );
    }

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
export async function createOrder(items: OrderItemInput[]): Promise<Order> {
  return request<Order>(`/orders`, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}
