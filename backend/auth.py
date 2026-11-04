# Autenticación del panel de administrador.
#
# Esquema simple y sin dependencias extra: token firmado con HMAC-SHA256.
#   token = base64url({"exp": <unix>}) + "." + firma
# El backend valida la firma y la expiración en cada request admin.
import base64
import hashlib
import hmac
import json
import time

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config import ADMIN_PASSWORD, ADMIN_TOKEN_TTL_SECONDS, SECRET_KEY

# auto_error=False: si no hay header Authorization, credentials es None y
# nosotros devolvemos un 401 con mensaje propio (en vez del 403 genérico).
_bearer = HTTPBearer(auto_error=False)


def _b64url(data: bytes) -> str:
    """Base64 sin padding (formato URL-safe, apto para header Authorization)."""
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _unb64url(text: str) -> bytes:
    """Invierte _b64url (restaura el padding perdido)."""
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def _sign(payload_b64: str) -> str:
    """Firma el payload con HMAC-SHA256 usando el secreto del servidor."""
    signature = hmac.new(
        SECRET_KEY.encode(),
        payload_b64.encode(),
        hashlib.sha256,
    ).digest()
    return _b64url(signature)


def verify_password(password: str) -> bool:
    """Compara la contraseña enviada con la del .env (comparación segura)."""
    return hmac.compare_digest(password.encode(), ADMIN_PASSWORD.encode())


def create_admin_token() -> tuple[str, int]:
    """Crea un token con expiración. Devuelve (token, expiración_en_unix)."""
    expires_at = int(time.time()) + ADMIN_TOKEN_TTL_SECONDS
    payload_b64 = _b64url(json.dumps({"exp": expires_at}).encode())
    return f"{payload_b64}.{_sign(payload_b64)}", expires_at


def verify_admin_token(token: str) -> bool:
    """True si la firma es válida y el token no expiró."""
    payload_b64, _, signature = token.partition(".")
    if not payload_b64 or not signature:
        return False

    # Comparación de firma en tiempo constante (evita ataques de timing).
    if not hmac.compare_digest(signature, _sign(payload_b64)):
        return False

    try:
        payload = json.loads(_unb64url(payload_b64))
        expires_at = payload["exp"]
    except (ValueError, KeyError, TypeError):
        return False

    return isinstance(expires_at, int) and expires_at > time.time()


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> None:
    """Dependencia que protege los endpoints admin.

    Sin header -> 401. Token inválido o expirado -> 401.
    (Que /admin esté "escondido" en el frontend no es seguridad:
    la validación SIEMPRE ocurre en el backend.)
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta la sesión de administrador. Ingresá nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_admin_token(credentials.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión de administrador expiró. Ingresá nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
