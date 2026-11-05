# Esquemas Pydantic: validación de datos de entrada y salida de la API.
import json
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# Categorías válidas del kiosco (mismas que en el frontend).
Category = Literal["bebidas", "snacks", "golosinas", "varios"]


# ===== Administración =====

class AdminLoginIn(BaseModel):
    """Body del login de administrador: solo contraseña (sin usuario)."""

    password: str = Field(min_length=1, description="La contraseña no puede estar vacía")


class AdminSessionOut(BaseModel):
    """Salida del login: token de sesión y cuándo expira."""

    token: str
    expires_at: int = Field(description="Expiración en segundos Unix (epoch)")


# ===== Productos =====

class ProductBase(BaseModel):
    """Datos comunes de un producto con sus validaciones."""

    name: str = Field(min_length=1, description="Nombre obligatorio, no puede estar vacío")
    category: Category
    price: float = Field(gt=0, description="El precio debe ser mayor a 0")
    stock: int = Field(ge=0, description="El stock no puede ser negativo")
    description: list[str] = Field(default_factory=list, description="Lista de características del producto")
    # Ruta de imagen (ej: "/uploads/products/abc.png") o emoji. Opcional.
    image: str | None = None


class ProductCreate(ProductBase):
    """Para crear un producto desde el panel de administración."""
    pass


class ProductUpdate(BaseModel):
    """Campos editables por el admin. Todos opcionales: actualización parcial."""

    name: str | None = Field(default=None, min_length=1)
    category: Category | None = None
    price: float | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    description: list[str] | None = Field(default=None, description="Lista de características del producto")
    image: str | None = None


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
    customer_name: str = Field(min_length=1, description="Nombre del cliente")
    delivery_method: str = Field(description="pickup o delivery")
    delivery_address: str | None = None
    delivery_name: str | None = None
    payment_method: str = Field(description="cash o transfer")


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
    customer_name: str
    delivery_method: str
    delivery_address: str | None = None
    delivery_name: str | None = None
    payment_method: str

    @classmethod
    def from_order(cls, order) -> "OrderOut":
        """Convierte el modelo Order (con items_json en texto) a OrderOut."""
        return cls(
            id=order.id,
            created_at=order.created_at,
            total=order.total,
            items=json.loads(order.items_json),
            customer_name=order.customer_name,
            delivery_method=order.delivery_method,
            delivery_address=order.delivery_address,
            delivery_name=order.delivery_name,
            payment_method=order.payment_method,
        )


class OrdersDeleted(BaseModel):
    """Salida de DELETE /api/orders: cuántos pedidos se borraron."""

    deleted: int = Field(ge=0)


# ===== Administración (stock, productos, dashboard) =====

class AdminStockIn(BaseModel):
    """Body de reponer stock: cuántas unidades se suman al stock actual."""

    quantity: int = Field(gt=0, description="Se suman al menos 1 unidad")


class AdminDeleted(BaseModel):
    """Salida de DELETE /api/admin/products/{id}."""

    deleted: int = Field(gt=0)


class LowStockProduct(BaseModel):
    """Producto con stock bajo (para las alertas del dashboard)."""

    id: int
    name: str
    stock: int
    model_config = ConfigDict(from_attributes=True)


class AdminStatsOut(BaseModel):
    """Resumen del dashboard de administración."""

    orders_today: int = Field(ge=0, description="Pedidos creados hoy")
    revenue_today: float = Field(ge=0, description="Suma de los totales de hoy")
    total_orders: int = Field(ge=0)
    total_products: int = Field(ge=0)
    low_stock: list[LowStockProduct] = Field(
        description="Productos con menos de 5 unidades"
    )
