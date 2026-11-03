// Categorías del kiosco, centralizadas en un solo lugar.
// Para agregar una categoría nueva: sumarla acá + al Literal Category en types/index.ts
// + al backend (seed de products).
import type { Category } from "../types";

export interface CategoryInfo {
  id: Category;
  label: string;
  emoji: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "bebidas", label: "Bebidas", emoji: "🥤" },
  { id: "snacks", label: "Snacks", emoji: "🍟" },
  { id: "golosinas", label: "Golosinas", emoji: "🍪" },
  { id: "varios", label: "Varios", emoji: "🔥" },
];
