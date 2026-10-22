# Endpoints de pedidos: POST /api/orders (crea y descuenta stock)
# y GET /api/orders (lista los pedidos).
import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import Order, Product
from schemas import OrderCreate, OrderItemOut, OrderOut

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Crea un pedido: valida stock, lo descuenta y guarda el pedido.

    Flujo (todo en la misma sesión: si algo falla, no se guarda nada):
    1. Busca cada producto del pedido (404 si alguno no existe).
    2. Verifica que haya stock suficiente para todas las cantidades (400 si no).
    3. Descuenta el stock.
    4. Calcula el total y guarda el pedido con sus ítems en JSON.
    """
    # Agrupamos cantidades por producto por si el mismo producto se repite en el body.
    requested: dict[int, int] = {}
    for item in order.items:
        requested[item.product_id] = requested.get(item.product_id, 0) + item.quantity

    order_items: list[OrderItemOut] = []
    total = 0.0

    # 1) Buscamos los productos y validamos que existan.
    for product_id in requested:
        product = db.get(Product, product_id)
        if product is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El producto con id {product_id} no existe",
            )

        quantity = requested[product_id]

        # 2) Verificamos stock suficiente (sin descontar todavía).
        if product.stock < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Stock insuficiente para '{product.name}': "
                    f"pediste {quantity} y quedan {product.stock}"
                ),
            )

        # 3) Descuento de stock.
        product.stock -= quantity

        # Acumulamos datos del ítem ya resuelto (nombre y precio al momento de comprar).
        subtotal = product.price * quantity
        total += subtotal
        order_items.append(
            OrderItemOut(
                product_id=product.id,
                name=product.name,
                quantity=quantity,
                price=product.price,
            )
        )

    # 4) Guardamos el pedido con sus ítems como JSON (como pide el modelo orders).
    db_order = Order(
        total=total,
        items_json=json.dumps(
            [item.model_dump() for item in order_items],
            ensure_ascii=False,
        ),
    )
    db.add(db_order)
    # Si algo falla acá, la sesión revierte todo (stock incluido).
    db.commit()
    db.refresh(db_order)

    return OrderOut.from_order(db_order)


@router.get("", response_model=list[OrderOut])
def get_orders(db: Session = Depends(get_db)):
    """Lista todos los pedidos, del más reciente al más antiguo."""
    orders = db.scalars(select(Order).order_by(Order.id.desc())).all()
    return [OrderOut.from_order(order) for order in orders]
