import { Package } from "lucide-react";
import type { Product } from "../types";
import { resolveImageUrl } from "../services/api";

interface ProductImageProps {
  product: Pick<Product, "name" | "image" | "category">;
  className?: string;
}

// Muestra la imagen real del producto si existe; si no, un icono de respaldo
// vectorial (Package) en lugar del emoji de antes.
//
// Las rutas guardadas en la base ("/uploads/products/x.png") se resuelven
// contra la URL del backend con resolveImageUrl; las URLs externas quedan
// tal cual. Cualquier otro valor (vacío o un emoji viejo guardado en el
// localStorage del carrito) muestra el icono, dimensionado con "2em" para
// que escale según el contexto (tarjeta, carrito o detalle).
function ProductImage({ product, className }: ProductImageProps) {
  const image = resolveImageUrl(product.image);

  if (image && (image.includes("/") || image.includes("."))) {
    return (
      <img
        src={image}
        alt={product.name}
        className={className}
        loading="lazy"
      />
    );
  }

  return (
    <span className={className} aria-hidden="true">
      <Package size="2em" strokeWidth={1.5} />
    </span>
  );
}

export default ProductImage;
