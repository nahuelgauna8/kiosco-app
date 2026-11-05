import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "../types";

// Clave de localStorage para guardar el carrito (con versión por si cambia
// la estructura de los datos en el futuro).
const CART_STORAGE_KEY = "kiosco-cart-v1";

// Valida que un objeto guardado en localStorage tenga la forma de un CartItem.
// Protege contra datos corruptos o de una versión vieja de la aplicación.
function isStoredCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as { product?: unknown; quantity?: unknown };

  if (
    typeof candidate.quantity !== "number" ||
    !Number.isInteger(candidate.quantity) ||
    candidate.quantity < 1
  ) {
    return false;
  }

  const product = candidate.product as Record<string, unknown> | null | undefined;
  if (typeof product !== "object" || product === null) return false;

  const description = product.description;
  const descriptionOk =
    typeof description === "string" ||
    (Array.isArray(description) &&
      description.every((item) => typeof item === "string"));

  return (
    typeof product.id === "number" &&
    typeof product.name === "string" &&
    typeof product.category === "string" &&
    typeof product.price === "number" &&
    typeof product.stock === "number" &&
    descriptionOk &&
    (product.image === undefined || typeof product.image === "string")
  );
}

// Migra items del carrito guardados con una versión anterior (description como string)
// al formato actual (description como array de strings).
function migrateStoredCartItem(item: CartItem): CartItem {
  const description = item.product.description;
  if (typeof description === "string") {
    return {
      ...item,
      product: {
        ...item.product,
        description: [description],
      },
    };
  }
  return item;
}

// Lee el carrito guardado. Si hay datos corruptos o no hay nada, devuelve [].
function loadStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isStoredCartItem).map(migrateStoredCartItem);
  } catch {
    // JSON inválido o localStorage inaccesible: empezamos con el carrito vacío.
    return [];
  }
}

// Valor que expone el Context del carrito a toda la app.
interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  // Estado del panel lateral (drawer): se abre desde el botón del header.
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Estado inicial: lo que esté guardado en localStorage (inicialización perezosa,
  // solo corre una vez al montar el Provider).
  const [items, setItems] = useState<CartItem[]>(loadStoredCart);

  // ¿Está abierto el panel lateral del carrito?
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  // Persistimos el carrito en localStorage cada vez que cambian los items:
  // así no se pierde al recargar la página o cerrar la pestaña.
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Sin storage (modo privado o límite lleno): el carrito sigue en memoria.
    }
  }, [items]);

  // Agrega un producto. Si ya está en el carrito, suma la cantidad.
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...prev, { product, quantity }];
    });
  }, []);

  // Quita un producto del carrito por su id.
  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  // Cambia la cantidad de un producto. Si la cantidad llega a 0 o menos, se elimina.
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.product.id !== productId)
        : prev.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
    );
  }, []);

  // Vacía el carrito por completo.
  const clearCart = useCallback(() => setItems([]), []);

  // Totales derivados del estado (se recalculan solo cuando cambian los items).
  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity * item.product.price, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isCartOpen,
      openCart,
      closeCart,
    }),
    [
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isCartOpen,
      openCart,
      closeCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook para consumir el carrito. Si se usa fuera del Provider, lanza un error
// claro en lugar de fallar en silencio.
export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de un <CartProvider>");
  }

  return context;
}
