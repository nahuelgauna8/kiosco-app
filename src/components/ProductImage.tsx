import type { Product } from "../types";

interface ProductImageProps {
  product: Pick<Product, "name" | "image" | "category">;
  className?: string;
}

// Muestra la imagen real del producto si existe; si no, un emoji de respaldo.
//
// Preparado para la carga futura de imágenes reales:
// - Si image es una ruta/URL (contiene "/" o ".", ej: "/images/coca.png"),
//   se renderiza como <img>.
// - Si es un emoji (ej: "🥤") o está vacío, se muestra el emoji / cajita 📦.
function ProductImage({ product, className }: ProductImageProps) {
  const image = product.image;

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
