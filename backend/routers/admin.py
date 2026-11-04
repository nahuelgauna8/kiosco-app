# Endpoints del panel de administrador.
#
# Todas las rutas (salvo /login) exigen un token válido:
#   Authorization: Bearer <token>
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from auth import create_admin_token, require_admin, verify_password
from schemas import AdminLoginIn, AdminSessionOut

router = APIRouter(prefix="/api/admin", tags=["admin"])


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
