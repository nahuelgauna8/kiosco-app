# Configuración sensible del panel de administrador.
#
# Lee las variables de backend/.env (archivo ignorado por git) y ofrece
# valores por defecto de desarrollo para que el proyecto funcione igual
# en una clone limpia sin crear el .env.
import os

from dotenv import load_dotenv

# Carga backend/.env si existe (no pisa variables ya definidas en el entorno).
load_dotenv()

# Contraseña del administrador (ingreso por PIN / clave, sin usuario).
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "kiosco2026")

# Secreto con el que se firman los tokens de sesión (HMAC-SHA256).
# En producción DEBE generarse uno propio en .env (secret.token_hex(64)).
SECRET_KEY = os.getenv("SECRET_KEY", "kiosco-dev-secret-cambiar-en-produccion")

# Duración de la sesión de administrador: 8 horas.
ADMIN_TOKEN_TTL_SECONDS = 8 * 60 * 60

# Umbral de alerta de stock bajo (el dashboard y el catálogo avisan
# cuando quedan menos de estas unidades).
LOW_STOCK_THRESHOLD = 5
