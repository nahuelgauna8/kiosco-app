# Modelos de la base de datos (tablas products y orders).
from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from database import Base


class Product(Base):
    """Tabla products: el catálogo del kiosco."""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    # bebidas / snacks / golosinas / varios (se valida en Pydantic con Literal)
    category: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    description: Mapped[str] = mapped_column(String, default="")
    # Ruta de la imagen subida desde el panel (ej: "/uploads/products/x.png").
    # None = sin imagen (el frontend muestra un 📦 de respaldo).
    image: Mapped[str | None] = mapped_column(String, nullable=True, default=None)


class Order(Base):
    """Tabla orders: cada pedido guarda sus ítems como JSON en texto."""

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    total: Mapped[float] = mapped_column(Float, nullable=False)
    # Datos del cliente y entrega
    customer_name: Mapped[str] = mapped_column(String, nullable=False, default="")
    delivery_method: Mapped[str] = mapped_column(String, nullable=False, default="pickup") # pickup | delivery
    delivery_address: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    delivery_name: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    payment_method: Mapped[str] = mapped_column(String, nullable=False, default="cash") # cash | transfer
    # JSON con los productos del pedido (ej: [{"product_id": 1, "quantity": 2, ...}])
    items_json: Mapped[str] = mapped_column(Text, nullable=False)
