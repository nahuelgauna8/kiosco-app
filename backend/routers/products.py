# Endpoints de productos: GET /api/products y GET /api/products/{id}
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import Product
from schemas import Category, ProductOut

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def get_products(
    # Query param opcional ?category=... Se valida con Pydantic (Literal):
    # una categoría inválida devuelve 422 automáticamente.
    category: Category | None = Query(default=None, description="Filtrar por categoría"),
    db: Session = Depends(get_db),
):
    """Lista todos los productos del catálogo, con filtro opcional por categoría."""
    statement = select(Product)

    if category is not None:
        statement = statement.where(Product.category == category)

    return db.scalars(statement.order_by(Product.id)).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Detalle de un producto por id. Devuelve 404 si no existe."""
    product = db.get(Product, product_id)

    if product is None:
        raise HTTPException(
            status_code=404,
            detail=f"El producto con id {product_id} no existe",
        )

    return product
