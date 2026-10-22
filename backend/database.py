# Conexión a la base de datos SQLite + configuración de SQLAlchemy.
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# La base se crea en backend/kiosco.db (ya ignorada por git).
SQLALCHEMY_DATABASE_URL = "sqlite:///./kiosco.db"

# check_same_thread=False: permite usar la conexión desde distintos threads
# (uvicorn atiende cada request en un hilo distinto).
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Clase base de todos los modelos (estilo SQLAlchemy 2.x).
class Base(DeclarativeBase):
    pass


# Dependencia que inyecta una sesión de BD en los endpoints.
# Se cierra siempre al terminar el request, aunque falle.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
