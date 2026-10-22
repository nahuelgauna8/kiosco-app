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
