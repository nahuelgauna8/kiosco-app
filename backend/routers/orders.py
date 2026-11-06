# Endpoints de pedidos: POST /api/orders (crea y descuenta stock),
# GET /api/orders (lista los pedidos) y DELETE /api/orders (borra el historial).
import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from database import get_db
from models import Order, Product
from schemas import OrderCreate, OrderItemOut, OrderOut, OrdersDeleted

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Crea un pedido: valida stock, lo descuenta y guarda el pedido."""
    try:
        return _create_order_impl(order, db)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

def _create_order_impl(order: OrderCreate, db: Session):
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
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        delivery_method=order.delivery_method,
        delivery_address=order.delivery_address,
        delivery_name=order.delivery_name,
        payment_method=order.payment_method,
    )
    db.add(db_order)
    # Si algo falla acá, la sesión revierte todo (stock incluido).
    db.commit()
    db.refresh(db_order)

    return OrderOut.from_order(db_order)


@router.get("", response_model=list[OrderOut])
def get_orders(db: Session = Depends(get_db)):
    """Lista todos los pedidos, del más reciente al más antiguo."""
    try:
        orders = db.scalars(select(Order).order_by(Order.id.desc())).all()
        return [OrderOut.from_order(order) for order in orders]
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("", response_model=OrdersDeleted)
def delete_orders(db: Session = Depends(get_db)):
    """Borra todo el historial de pedidos.

    No modifica el stock de los productos: los pedidos ya descontaron su
    stock al crearse, borrar el historial no lo devuelve.
    """
    deleted = db.scalar(select(func.count()).select_from(Order)) or 0
    db.execute(delete(Order))
    db.commit()
    return OrdersDeleted(deleted=deleted)
