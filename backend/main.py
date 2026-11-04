# API del Kiosco El Rápido - FastAPI + SQLite + Pydantic
#
# Arranque (desde la carpeta backend/):
#   uvicorn main:app --reload
#
# Documentación interactiva: http://127.0.0.1:8000/docs
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect as sqlalchemy_inspect

from database import Base, SessionLocal, engine
from routers import admin, orders, products

# Importamos los modelos para que registren sus tablas en Base.metadata.
# (Sin este import, create_all no sabe qué tablas crear.)
from models import Order, Product  # noqa: F401
from seed import seed_products

# Crea las tablas (products y orders) si no existen.
# En producción conviene usar Alembic para migraciones.
Base.metadata.create_all(bind=engine)


# Migración ligera: agrega columnas que falten en tablas existentes.
# create_all() NO agrega columnas a tablas que ya existen, así que si la
# base nació sin la columna image, hay que agregarla con ALTER TABLE.
def migrate_missing_columns() -> None:
    inspector = sqlalchemy_inspect(engine)
    if "products" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("products")}
    if "image" not in columns:
        with engine.begin() as connection:
            connection.exec_driver_sql("ALTER TABLE products ADD COLUMN image VARCHAR")
        print("Migración aplicada: products.image agregada.")


migrate_missing_columns()

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
app.include_router(admin.router)
app.include_router(products.router)
app.include_router(orders.router)

# Sirve las imágenes subidas desde el panel: GET /uploads/products/<archivo>.
# (La ruta en la base es relativa: "/uploads/products/x.png".)
UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/", tags=["health"])
def read_root():
    """Health check simple para verificar que la API está viva."""
    return {"status": "ok", "api": "Kiosco El Rápido"}
