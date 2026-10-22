# Modelos de la base de datos (tablas products y orders).
from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

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


class Order(Base):
    """Tabla orders: cada pedido guarda sus ítems como JSON en texto."""

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[str] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    total: Mapped[float] = mapped_column(Float, nullable=False)
    # JSON con los productos del pedido (ej: [{"product_id": 1, "quantity": 2, ...}])
    items_json: Mapped[str] = mapped_column(Text, nullable=False)
