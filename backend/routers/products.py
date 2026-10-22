# Endpoints de productos: GET /api/products y GET /api/products/{id}
# (Tarea 2.2)
from fastapi import APIRouter

router = APIRouter(prefix="/api/products", tags=["products"])
