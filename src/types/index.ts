// Tipos compartidos de la aplicación (Parte 1 - Kiosco El Rápido)

export type Category = "bebidas" | "snacks" | "golosinas" | "varios";

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  stock: number;
  description: string;
  image?: string; // opcional: puede ser un emoji o una URL
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
