// Categorías del kiosco, centralizadas en un solo lugar.
// Para agregar una categoría nueva: sumarla acá + al Literal Category en types/index.ts
// + al backend (seed de products).
// Cada categoría lleva un icono vectorial de lucide-react (antes: emoji).
import type { LucideIcon } from "lucide-react";
import { Cookie, CupSoda, Flame, Popcorn } from "lucide-react";
import type { Category } from "../types";

export interface CategoryInfo {
  id: Category;
  label: string;
  icon: LucideIcon;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "bebidas", label: "Bebidas", icon: CupSoda },
  { id: "snacks", label: "Snacks", icon: Popcorn },
  { id: "golosinas", label: "Golosinas", icon: Cookie },
  { id: "varios", label: "Varios", icon: Flame },
];
