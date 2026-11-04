// Tipos compartidos de la aplicación (Parte 1 - Kiosco El Rápido)

export type Category = "bebidas" | "snacks" | "golosinas" | "varios";

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  stock: number;
  description: string[];
  image?: string; // opcional: puede ser una URL o ruta relativa. Opcional.
}

// Item del carrito: combina un producto con la cantidad elegida
export interface CartItem {
  product: Product;
  quantity: number;
}

// ===== Pedidos (API - Parte 2) =====

// Body que enviamos al POST /api/orders
export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

// Ítem del pedido tal como lo responde el backend (con nombre y precio ya fijados)
export interface OrderItemDetail {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

// Pedido devuelto por la API
export interface Order {
  id: number;
  created_at: string;
  total: number;
  items: OrderItemDetail[];
}

// ===== Administración (API - panel admin) =====

// Respuesta de POST /api/admin/login (expires_at en segundos Unix)
export interface AdminSession {
  token: string;
  expires_at: number;
}

// Body para crear/editar un producto desde el panel de administración
export interface ProductInput {
  name: string;
  category: Category;
  price: number;
  stock: number;
  description: string[];
  image?: string;
}

// Producto con stock bajo (alerta del dashboard y del catálogo)
export interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
}

// Respuesta de GET /api/admin/stats (resumen del dashboard)
export interface AdminStats {
  orders_today: number;
  revenue_today: number;
  total_orders: number;
  total_products: number;
  low_stock: LowStockProduct[];
}
