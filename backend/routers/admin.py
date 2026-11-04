# Endpoints del panel de administrador.
#
# Todas las rutas (salvo /login) exigen un token válido:
#   Authorization: Bearer <token>
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from auth import create_admin_token, require_admin, verify_password
from config import LOW_STOCK_THRESHOLD
from database import get_db
from models import Order, Product
from schemas import (
    AdminDeleted,
    AdminLoginIn,
    AdminSessionOut,
    AdminStatsOut,
    AdminStockIn,
    ProductCreate,
    ProductOut,
    ProductUpdate,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _get_product_or_404(product_id: int, db: Session) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El producto con id {product_id} no existe",
        )
    return product


# ===== Sesión =====


@router.post("/login", response_model=AdminSessionOut)
def login(credentials: AdminLoginIn):
    """Ingreso de administrador: valida la contraseña y entrega un token.

    La contraseña vive en backend/.env (ADMIN_PASSWORD). Si está mal,
    responde 401. El token dura 8 horas y se envía en cada request admin.
    """
    if not verify_password(credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta.",
        )

    token, expires_at = create_admin_token()
    return AdminSessionOut(token=token, expires_at=expires_at)


@router.get("/me", dependencies=[Depends(require_admin)])
def me():
    """Verifica que la sesión siga siendo válida (la usa el frontend al cargar)."""
    return {"admin": True, "session_valid_until": datetime.now(timezone.utc).isoformat()}


# ===== Gestión de productos (protegida) =====


@router.post(
    "/products",
    response_model=ProductOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    """Da de alta un producto nuevo en el catálogo."""
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put(
    "/products/{product_id}",
    response_model=ProductOut,
    dependencies=[Depends(require_admin)],
)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
):
    """Edita campos de un producto (actualización parcial: solo lo que llegue)."""
    product = _get_product_or_404(product_id, db)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.post(
    "/products/{product_id}/stock",
    response_model=ProductOut,
    dependencies=[Depends(require_admin)],
)
def restock_product(
    product_id: int,
    data: AdminStockIn,
    db: Session = Depends(get_db),
):
    """Reponer stock: suma las unidades indicadas al stock actual."""
    product = _get_product_or_404(product_id, db)
    product.stock += data.quantity
    db.commit()
    db.refresh(product)
    return product


@router.delete(
    "/products/{product_id}",
    response_model=AdminDeleted,
    dependencies=[Depends(require_admin)],
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Elimina un producto del catálogo.

    Los pedidos históricos no se tocan: guardan nombre y precio como
    snapshot en items_json, así el historial sigue siendo correcto.
    """
    product = _get_product_or_404(product_id, db)
    db.delete(product)
    db.commit()
    return AdminDeleted(deleted=product_id)


# ===== Dashboard =====


@router.get("/stats", response_model=AdminStatsOut, dependencies=[Depends(require_admin)])
def get_stats(db: Session = Depends(get_db)):
    """Resumen del dashboard: pedidos del día, ingresos y stock bajo.

    created_at se guarda en UTC (CURRENT_TIMESTAMP), por eso se convierte
    a hora local con date(..., 'localtime') antes de comparar con "hoy".
    """
    is_today = func.date(Order.created_at, "localtime") == func.date("now", "localtime")

    orders_today = (
        db.scalar(select(func.count()).select_from(Order).where(is_today)) or 0
    )
    revenue_today = (
        db.scalar(
            select(func.coalesce(func.sum(Order.total), 0.0)).where(is_today)
        )
        or 0.0
    )
    total_orders = db.scalar(select(func.count()).select_from(Order)) or 0
    total_products = db.scalar(select(func.count()).select_from(Product)) or 0

    # Productos con menos de LOW_STOCK_THRESHOLD unidades (agotándose).
    low_stock = db.scalars(
        select(Product)
        .where(Product.stock < LOW_STOCK_THRESHOLD)
        .order_by(Product.stock, Product.name)
    ).all()

    return AdminStatsOut(
        orders_today=orders_today,
        revenue_today=revenue_today,
        total_orders=total_orders,
        total_products=total_products,
        low_stock=low_stock,
    )
