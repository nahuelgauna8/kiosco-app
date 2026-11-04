import type { Product } from "../types";
import { resolveImageUrl } from "../services/api";

interface ProductImageProps {
  product: Pick<Product, "name" | "image" | "category">;
  className?: string;
}

// Muestra la imagen real del producto si existe; si no, un emoji de respaldo.
//
// Las rutas guardadas en la base ("/uploads/products/x.png") se resuelven
// contra la URL del backend con resolveImageUrl; las URLs externas y los
// emojis (ej: "🥤") quedan tal cual.
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
      {image ?? "📦"}
    </span>
  );
}

export default ProductImage;
