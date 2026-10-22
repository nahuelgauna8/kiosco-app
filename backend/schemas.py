# Esquemas Pydantic: validación de datos de entrada y salida de la API.
import json
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# Categorías válidas del kiosco (mismas que en el frontend).
Category = Literal["bebidas", "snacks", "golosinas", "varios"]


# ===== Productos =====

class ProductBase(BaseModel):
    """Datos comunes de un producto con sus validaciones."""

    name: str = Field(min_length=1, description="Nombre obligatorio, no puede estar vacío")
    category: Category
    price: float = Field(gt=0, description="El precio debe ser mayor a 0")
    stock: int = Field(ge=0, description="El stock no puede ser negativo")
    description: str = ""


class ProductCreate(ProductBase):
    """Para crear un producto (si algún día se agrega ese endpoint)."""
    pass


class ProductOut(ProductBase):
    """Salida de un producto: agrega el id."""

    id: int
    # from_attributes=True permite convertir desde el modelo de SQLAlchemy.
    model_config = ConfigDict(from_attributes=True)


# ===== Pedidos (orders) =====

class OrderItem(BaseModel):
    """Ítem de un pedido: producto + cantidad."""

    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, description="La cantidad debe ser al menos 1")


class OrderCreate(BaseModel):
    """Body para crear un pedido: {"items": [...]}"""

    items: list[OrderItem] = Field(min_length=1, description="El pedido debe tener al menos 1 ítem")


class OrderItemOut(BaseModel):
    """Ítem ya resuelto (con nombre y precio al momento de comprar)."""

    product_id: int
    name: str
    quantity: int
    price: float


class OrderOut(BaseModel):
    """Salida de un pedido."""

    id: int
    created_at: datetime
    total: float
    items: list[OrderItemOut]

    @classmethod
    def from_order(cls, order) -> "OrderOut":
        """Convierte el modelo Order (con items_json en texto) a OrderOut."""
        return cls(
            id=order.id,
            created_at=order.created_at,
            total=order.total,
            items=json.loads(order.items_json),
        )
