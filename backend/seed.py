# Siembra inicial de la base de datos con el catálogo del kiosco.
# Se ejecuta al arrancar la app (main.py) y solo inserta si products está vacía,
# así no duplica productos entre reinicios.
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from models import Product

# Mismos productos (y mismos ids) que el mock del frontend en la Parte 1.
PRODUCTS = [
    {"id": 1, "name": "Coca-Cola 500ml", "category": "bebidas", "price": 1200, "stock": 25, "description": "Gaseosa clásica"},
    {"id": 2, "name": "Agua mineral 500ml", "category": "bebidas", "price": 800, "stock": 40, "description": "Agua sin gas"},
    {"id": 3, "name": "Papas Lays Clásicas", "category": "snacks", "price": 1500, "stock": 30, "description": "Papas fritas clásicas"},
    {"id": 4, "name": "Alfajor Jorgito", "category": "golosinas", "price": 900, "stock": 50, "description": "Alfajor de chocolate"},
    {"id": 5, "name": "Chicles Beldent", "category": "golosinas", "price": 600, "stock": 60, "description": "Pack de chicles"},
    {"id": 6, "name": "Cigarrillos", "category": "varios", "price": 2500, "stock": 20, "description": "Atado de cigarrillos"},
    {"id": 7, "name": "Gatorade 500ml", "category": "bebidas", "price": 1800, "stock": 15, "description": "Bebida isotónica"},
    {"id": 8, "name": "Maní salado", "category": "snacks", "price": 1100, "stock": 35, "description": "Maní tostado con sal"},
    {"id": 9, "name": "Chocolate Águila", "category": "golosinas", "price": 1400, "stock": 22, "description": "Barra de chocolate con leche"},
    {"id": 10, "name": "Encendedor", "category": "varios", "price": 1500, "stock": 18, "description": "Encendedor descartable"},
]


def seed_products(db: Session) -> None:
    """Inserta los productos del catálogo solo si la tabla está vacía."""
    count = db.scalar(select(func.count()).select_from(Product))

    if count and count > 0:
        return  # Ya hay productos: no hacemos nada.

    db.add_all(Product(**data) for data in PRODUCTS)
    db.commit()
