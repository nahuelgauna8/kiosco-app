# 🏪 Kiosco El Rápido – TP4 Programación 4

Aplicación web full-stack para un kiosco de barrio.

- **Parte 1 (completada):** Frontend SPA con React + TypeScript + React Router + Context API, integrado con API backend.
- **Parte 2 (completada):** Backend con FastAPI + SQLite + Pydantic, integración frontend ↔ backend con loading y errores visibles, panel de administración completo.

## 🧑‍💻 Equipo

| Integrante |
|------------|
| Nahuel Gauna |
| Damián Mazzarella |

## 🚀 Cómo correr el frontend (Parte 1)

Requisitos: Node.js 20+ y npm. **El backend debe estar corriendo en el puerto 8000** (ver sección siguiente), porque el frontend consume su API.

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npm run dev
```

Abrí <http://localhost:5173> en el navegador.

### Otros comandos útiles

```bash
npm run build    # Build de producción (compila TypeScript + Vite)
npm run preview  # Vista previa del build de producción
npm run lint     # Lint (oxlint)
```

## 🚀 Cómo correr el backend (Parte 2)

Requisitos: Python 3.11+.

```bash
# 1. Ir a la carpeta del backend
cd backend

# 2. Crear el entorno virtual (solo la primera vez)
python -m venv .venv

# 3. Instalar dependencias (solo la primera vez)
.venv\Scripts\pip install -r requirements.txt   # Windows
# source .venv/bin/pip install -r requirements.txt   # Linux/Mac

# 4. Levantar el servidor
.venv\Scripts\uvicorn main:app --reload   # Windows
# source .venv/bin/uvicorn main:app --reload   # Linux/Mac
```

- API: <http://127.0.0.1:8000>
- Documentación interactiva (`/docs`): <http://127.0.0.1:8000/docs>
- La base SQLite (`kiosco.db`) se crea sola en `backend/` al arrancar (está ignorada por git).

## 📁 Estructura del proyecto

```
src/
├── components/       # Header, Footer, Layout, ProductCard, CartItem, Modal, ConfirmDialog
│   └── admin/        # AdminLogin, AdminPanel, DashboardStats, formularios y diálogos
├── context/          # CartContext (carrito) y AdminContext (sesión de administrador)
├── pages/            # Home, Products, ProductDetail, Cart, Orders, Admin, NotFound
├── services/         # api.ts (fetch al backend) y adminSession.ts (token en localStorage)
├── types/            # Interfaces compartidas (Product, CartItem, Order, AdminStats, ...)
├── App.tsx           # Rutas de la aplicación
└── main.tsx          # Punto de entrada

backend/
├── main.py           # App FastAPI + CORS + migración ligera + carpeta uploads/
├── config.py         # Config sensible (contraseña admin, secreto del token) desde .env
├── auth.py           # Token HMAC de administrador + dependencia require_admin
├── database.py       # Conexión SQLite + SQLAlchemy (Base, get_db)
├── models.py         # Modelos Product y Order (tablas)
├── schemas.py        # Esquemas Pydantic (validación de entrada/salida)
├── routers/          # products.py, orders.py y admin.py (endpoints)
├── requirements.txt  # Dependencias del backend
└── .venv/            # Entorno virtual (ignorado por git)
```

## ✅ Estado del proyecto: FINALIZADO

Ambas partes del TP4 están implementadas y verificadas:

### ✅ Parte 1 – Frontend (React + TypeScript)
- Layout global con Header, Footer y `<Outlet />` en todas las rutas.
- Rutas: `/`, `/products`, `/products/:id`, `/cart`, `/orders`, `/admin`, 404.
- Navegación SPA con `Link` / `NavLink` (sin recargas).
- `CartContext` con `items`, `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `totalItems`, `totalPrice`.
- Catálogo con filtro por categoría (`?category=...`), búsqueda y ordenamiento.
- Detalle de producto con imagen, precio, stock, características en viñetas y selector de cantidad.
- Carrito persistente en `localStorage`, resumen, totales y vaciado.
- Página "Mis pedidos" con historial y borrado con confirmación.
- **Checkout previo:** nombre del cliente, método de entrega (retiro/envío a domicilio con dirección), medio de pago (efectivo/transferencia), guardado en el pedido y visible en "Mis pedidos" y panel admin.

### ✅ Parte 2 – Backend (FastAPI + SQLite)
- Modelos `Product` y `Order` con SQLAlchemy.
- Endpoints: `GET /api/products`, `GET /api/products/{id}`, `POST /api/orders`, `GET /api/orders`, `DELETE /api/orders`.
- Validaciones Pydantic: `name` no vacío, `price > 0`, `stock >= 0`.
- Verificación y descuento de stock al crear pedidos.
- CORS habilitado para `localhost:5173`.
- Panel de administración: login (contraseña `kiosco2026`), token HMAC con expiración 8h, CRUD de productos, reabastecimiento, subida de imágenes, dashboard de estadísticas.
- **Pedidos con datos de cliente y entrega:** `Order` guarda `customer_name`, `delivery_method`, `delivery_address`, `delivery_name`, `payment_method`. Migración automática de columnas en `backend/kiosco.db`.

## 📌 Plan de trabajo (completado)

- [x] **Tarea 1.1** – Init Vite + React + TS, estructura de carpetas y datos mock
- [x] **Tarea 1.2** – Layout global (Header + Footer + Outlet) y rutas con React Router
- [x] **Tarea 1.3** – CartContext (carrito con Context API)
- [x] **Tarea 1.4** – Página Products con filtro por categoría (query params)
- [x] **Tarea 1.5** – Página ProductDetail (path params) + Home
- [x] **Tarea 1.6** – Página Cart + "Finalizar pedido" (fin Parte 1)
- [x] **Tarea 2.1** – Backend FastAPI + SQLite + Pydantic + CORS
- [x] **Tarea 2.2** – Endpoints GET de productos
- [x] **Tarea 2.3** – Endpoint POST de pedidos (descuento de stock)
- [x] **Tarea 2.4** – Integración frontend ↔ API con loading y errores visibles

### 🎨 Rediseño de interfaz

- [x] **R.1** – Header nuevo (búsqueda + menú Categorías + botón de carrito), barra de categorías y Home exclusivamente de bienvenida con banner + CTA
- [x] **R.2** – Catálogo con sidebar de categorías, barra de ordenamiento, búsqueda por nombre y tarjetas con imágenes completas (`object-fit: contain`)
- [x] **R.3** – Carrito como panel lateral (drawer) deslizante con resumen, cantidades y total

### 🚀 Mejoras

- [x] **M.1** – Carrito persistente en localStorage
- [x] **M.2** – Historial de pedidos: página "Mis pedidos" con GET /api/orders
- [x] **M.3** – Borrar historial: endpoint DELETE /api/orders + botón con confirmación
- [x] **M.4** – Modal de confirmación propio (ConfirmDialog)

### 🔧 Panel de administrador (fase 4)

- [x] **A.1** – Backend: autenticación de administrador (login por clave, token HMAC con expiración, endpoints protegidos)
- [x] **A.2** – Backend: CRUD admin de productos + reponer stock + dashboard + migración de la columna `image`
- [x] **A.3** – Backend: subida de imágenes (multipart, validación, carpeta `uploads/` servida por FastAPI)
- [x] **A.4** – Frontend: sesión de admin (Context + token en localStorage), ruta `/admin` con login, link "⚙️ Ajustes" en el footer y badge "🔧 Modo admin" en el header
- [x] **A.5** – Frontend: panel `/admin` con dashboard (pedidos del día, ingresos, productos por agotarse) y alta de productos con imagen (URL o archivo)
- [x] **A.6** – Frontend: edición inline en el catálogo (editar / reponer / eliminar) con alerta de stock bajo

### 🛒 Checkout con datos de cliente y entrega (fase 5)

- [x] **AB.1** – Checkout previo: botón "Proceder al pedido" abre formulario con nombre, método de entrega (retiro/envío a domicilio con dirección) y medio de pago (efectivo/transferencia)
- [x] **AB.2** – Rediseño del checkout: tarjetas grandes, centradas y con movimiento; estados seleccionados con borde/fondo naranja e iconos lucide (Store, Truck, Banknote, CreditCard)
- [x] **Z.2** – Backend: `Order` con `customer_name`, `delivery_method`, `delivery_address`, `delivery_name`, `payment_method`; endpoints y serialización actualizados
- [x] **AA.1** – Fix: pedidos con campos nulos no rompían `GET /api/orders` (valor por defecto en `OrderOut.from_order()` + try/except en el endpoint)
- [x] **AA.2** – No versionar `kiosco.db` ni `.venv`; `.gitignore` actualizado
- [x] **R.1** – Fix error 500 al reponer stock (restauración de `description` a lista antes de retornar)
- [x] **T.1** – Fix error 500 al subir imagen de producto (mismo fix)
- [x] **S.1** – Imágenes de productos se ven completas en el catálogo (`object-fit: contain`)
- [x] **O.1** – Detalle de producto: se eliminaron las miniaturas, se conserva solo la imagen principal grande
- [x] **P.1** – Badge de categoría con ancho ajustado al texto
- [x] **Q.1** – Título, precio y stock alineados con los checks de características
- [x] **M.1** – Quita timeout de 8s en peticiones a la API (evita error falso al guardar)
- [x] **I.1** – Icono de ajustes (engranaje) en el Navbar, visible solo sin sesión de admin, redirige a `/admin`
- [x] **G.1** – Botón "Modo admin" enlaza al panel de administración

**Acceso al panel:** link "⚙️ Ajustes" en el footer o URL directa `/admin`.  
Clave por defecto: `kiosco2026` (se cambia en `backend/.env`, archivo ignorado por git).

> Las imágenes de productos se cargan desde `backend/uploads/products/` y se sirven mediante FastAPI. El componente `ProductImage` renderiza automáticamente la imagen o un ícono de respaldo si no hay imagen.

> 📌 **Detalles y decisiones de diseño** del panel en [PLAN-ADMIN.md](PLAN-ADMIN.md).