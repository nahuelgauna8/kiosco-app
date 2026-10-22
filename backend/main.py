# API del Kiosco El Rápido - FastAPI + SQLite + Pydantic
#
# Arranque (desde la carpeta backend/):
#   uvicorn main:app --reload
#
# Documentación interactiva: http://127.0.0.1:8000/docs
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, SessionLocal, engine
from routers import orders, products

# Importamos los modelos para que registren sus tablas en Base.metadata.
# (Sin este import, create_all no sabe qué tablas crear.)
from models import Order, Product  # noqa: F401
from seed import seed_products

# Crea las tablas (products y orders) si no existen.
# En producción conviene usar Alembic para migraciones.
Base.metadata.create_all(bind=engine)

# Siembra el catálogo solo la primera vez (si products está vacía).
with SessionLocal() as db:
    seed_products(db)

app = FastAPI(
    title="Kiosco El Rápido API",
    description="API del kiosco de barrio: productos y pedidos.",
    version="1.0.0",
)

# CORS: permite que el frontend (Vite en el puerto 5173) llame a esta API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Incluimos los routers de cada recurso.
app.include_router(products.router)
app.include_router(orders.router)


@app.get("/", tags=["health"])
def read_root():
    """Health check simple para verificar que la API está viva."""
    return {"status": "ok", "api": "Kiosco El Rápido"}
