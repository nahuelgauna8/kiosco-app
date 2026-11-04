# 📌 Plan: Panel de administrador

> ✅ **IMPLEMENTADO** (fase 4, commits A.1–A.6, ver README). Este documento
> conserva el análisis previo y las decisiones que se tomaron.

## ✅ Decisiones tomadas (análisis previo → implementado)

1. **Entrada al panel**
   - Link **"⚙️ Ajustes" en el footer** + **URL directa `/admin`** (las dos conviven).
   - Sin sesión válida → pantalla **"Ingreso administrador"** con **clave de acceso
     sola** (sin usuario; el cliente NO tiene login: solo el admin).

2. **Estilo híbrido de gestión**
   - Página `/admin` para **cargar productos nuevos** + dashboard.
   - Con sesión activa, botones **"✏️ Editar"**, **"📦 Reponer"** y **"🗑️ Eliminar"**
     en las tarjetas del catálogo (acción rápida sin salir del listado).

3. **Imágenes de productos**
   - **Subir archivo** desde el panel **o pegar una URL** (las dos opciones).

## 🔑 Login (implementado)

- Contraseña en `.env` del backend (`ADMIN_PASSWORD`), fuera del código y
  **nunca subida a GitHub** (hay valor por defecto `kiosco2026` para clones limpias).
- `POST /api/admin/login` → devuelve un **token firmado (HMAC-SHA256) con
  expiración de 8 horas**.
- El token se guarda en el navegador y se envía en `Authorization: Bearer`.
- **El backend valida siempre** en los endpoints admin: que `/admin` esté
  "escondido" en el footer no es seguridad (cualquiera puede escribir la URL).

## 🗒️ Endpoints implementados

- `POST   /api/admin/login` (clave → token)
- `GET    /api/admin/me` (valida la sesión; el frontend la chequea al cargar)
- `GET    /api/admin/stats` (dashboard: pedidos del día, ingresos, stock bajo)
- `POST   /api/admin/products` (alta)
- `PUT    /api/admin/products/{id}` (edición parcial)
- `POST   /api/admin/products/{id}/stock` (reponer stock)
- `DELETE /api/admin/products/{id}`
- `POST   /api/admin/products/{id}/image` (subida multipart, jpg/png/webp/gif ≤ 5 MB)

## ⚠️ Detalles técnicos (resueltos)

- La tabla `products` existente **no tenía la columna `image`**: se agregó con
  una migración ligera en `main.py` (`ALTER TABLE ... ADD COLUMN`), porque
  `create_all()` **no** agrega columnas a tablas que ya existen.
- Las imágenes se guardan en `backend/uploads/products/` (nombre uuid) y se
  sirven con `GET /uploads/...` (StaticFiles). En la base queda la ruta
  relativa y el frontend le antepone la URL del backend (`resolveImageUrl`).
- `.env` y `uploads/` están en `backend/.gitignore`.

## 📅 Fases (todas completadas)

1. ✅ **Login + token + endpoint protegido** (la puerta)
2. ✅ **Alta de productos + reponer stock** (lo esencial)
3. ✅ **Imágenes** (columna en la base + subida/URL)
4. ✅ **Extras**: editar/eliminar productos, badge "🔧 Modo admin" en el header,
   alertas de stock bajo, dashboard (pedidos del día, ingresos)

## 🎨 Extras implementados

- Badge "🔧 Modo admin" visible mientras dure la sesión + "Cerrar sesión"
  (header y panel).
- Alerta de stock bajo: badge en la tarjeta (menos de 5 unidades) + lista en
  el dashboard.
- Dashboard con métricas simples: pedidos de hoy, ingresos de hoy, productos
  en catálogo y productos por agotarse.
