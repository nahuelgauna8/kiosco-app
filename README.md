# 🏪 Kiosco El Rápido – TP4 Programación 4

Aplicación web full-stack para un kiosco de barrio.

- **Parte 1 (actual):** Frontend SPA con React + TypeScript + React Router + Context API (datos mock).
- **Parte 2 (próxima):** Backend con FastAPI + SQLite + Pydantic e integración frontend ↔ backend.

## 🧑‍💻 Equipo

| Integrante |
|------------|
| Nahuel Gauna |
| Damián |

## 🚀 Cómo correr el frontend (Parte 1)

Requisitos: Node.js 20+ y npm.

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

## 📁 Estructura del proyecto

```
src/
├── components/   # Header, Footer, Layout, ProductCard, CartItem
├── context/      # CartContext (carrito con useContext + useState)
├── pages/        # Home, Products, ProductDetail, Cart, NotFound
├── types/        # Interfaces compartidas (Product, CartItem, ...)
├── data/         # products.ts (datos mock de la Parte 1)
├── App.tsx       # Rutas de la aplicación
└── main.tsx      # Punto de entrada
```

## 📌 Plan de trabajo

Esta Parte 1 avanza tarea por tarea, con un commit por tarea:

- [x] **Tarea 1.1** – Init Vite + React + TS, estructura de carpetas y datos mock
- [x] **Tarea 1.2** – Layout global (Header + Footer + Outlet) y rutas con React Router
- [x] **Tarea 1.3** – CartContext (carrito con Context API)
- [x] **Tarea 1.4** – Página Products con filtro por categoría (query params)
- [x] **Tarea 1.5** – Página ProductDetail (path params) + Home
- [ ] **Tarea 1.6** – Página Cart + "Finalizar pedido" simulado (fin Parte 1)
- [ ] **Tarea 2.1** – Backend FastAPI + SQLite + Pydantic + CORS
- [ ] **Tarea 2.2** – Endpoints GET de productos
- [ ] **Tarea 2.3** – Endpoint POST de pedidos (descuento de stock)
- [ ] **Tarea 2.4** – Integración frontend ↔ API con loading y errores visibles
