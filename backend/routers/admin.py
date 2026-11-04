# Endpoints del panel de administrador.
#
# Todas las rutas (salvo /login) exigen un token válido:
#   Authorization: Bearer <token>
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
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

# Extensiones de imagen permitidas (en minúsculas, con punto).
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
# Tamaño máximo de la imagen: 5 MB.
MAX_IMAGE_BYTES = 5 * 1024 * 1024
# Carpeta de imágenes subidas: backend/uploads/products/
UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads" / "products"


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
    data_dict = data.model_dump()
    # description llega como lista de características; se guarda como JSON
    # en la columna description (VARCHAR) de SQLite.
    if isinstance(data_dict.get("description"), list):
        description_list = data_dict["description"]
        data_dict["description"] = json.dumps(data_dict["description"])
    product = Product(**data_dict)
    db.add(product)
    db.commit()
    db.refresh(product)

    # Restaurar la lista original para la respuesta de la API.
    if 'description_list' in locals():
        product.description = description_list

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
        # description llega como lista de características; se guarda como JSON
        # en la columna description (VARCHAR) de SQLite.
        if field == "description" and isinstance(value, list):
            description_list = value
            value = json.dumps(value)
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    # Restaurar la lista original para la respuesta de la API (ProductOut
    # espera list[str], no el JSON string de la BD).
    if 'description_list' in locals():
        product.description = description_list

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

    # Restaurar la lista original para la respuesta de la API (ProductOut
    # espera list[str], no el JSON string de la BD).
    if isinstance(product.description, str):
        try:
            parsed = json.loads(product.description)
            if isinstance(parsed, list):
                product.description = parsed
        except (json.JSONDecodeError, TypeError):
            product.description = [product.description] if product.description else []

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


@router.post(
    "/products/{product_id}/image",
    response_model=ProductOut,
    dependencies=[Depends(require_admin)],
)
def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Sube una imagen del producto y guarda su ruta en la base.

    - Formatos permitidos: jpg, jpeg, png, webp, gif (máximo 5 MB).
    - El archivo se guarda en backend/uploads/products/ con nombre único
      (uuid) para que dos subidas nunca se pisen.
    - En la base queda "/uploads/products/<archivo>": FastAPI la sirve en
      GET /uploads/... y el frontend le antepone la URL del API.
    """
    product = _get_product_or_404(product_id, db)

    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Formato no permitido ({extension or 'sin extensión'}). "
                "Usá JPG, PNG, WEBP o GIF."
            ),
        )

    # Leemos de más1 byte para detectar si supera el máximo sin cargar todo.
    content = file.file.read(MAX_IMAGE_BYTES + 1)
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La imagen supera los 5 MB.",
        )
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo está vacío.",
        )

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{extension}"
    (UPLOADS_DIR / filename).write_bytes(content)

    product.image = f"/uploads/products/{filename}"
    db.commit()
    db.refresh(product)
    return product


# ===== Dashboard =====


@router.get("/stats", response_model=AdminStatsOut, dependencies=[Depends(require_admin)])
def get_stats(db: Session = Depends(get_db)):
    """Resumen del dashboard: pedidos del día, ingresos y stock bajo.

    created_at se guarda en UTC (CURRENT_TIMESTAMP), por eso se compara
    directamente en UTC contra la fecha de hoy del servidor. Se evita
    usar "localtime" en created_at porque convertiría la hora del pedido
    a la zona horaria del servidor y podría atribuirlo al día anterior
    (ej: un pedido a las 00:30 UTC en zona UTC-3 es del día anterior
    en hora local).
    """
    is_today = func.date(Order.created_at) == func.date("now")

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
