# 📌 Plan: Panel de administrador (PENDIENTE)

> Análisis previo guardado el 03/11/2026. **No implementar hasta que el equipo
> dé luz verde.** Este documento existe para retomar el diseño cuando se arranque.

## ✅ Decisiones ya tomadas (en el análisis previo)

1. **Entrada al panel**
   - Link **"⚙️ Ajustes" en el footer** + **URL directa `/admin`**.
   - Sin sesión válida → pantalla **"Ingreso administrador"** con usuario y contraseña
     (el cliente NO tiene login: solo el admin).

2. **Estilo híbrido de gestión**
   - Página `/admin` para **cargar productos nuevos**.
   - Con sesión activa, botones **"✎ Editar"** y **"📦 Reponer"** en las tarjetas
     del catálogo (acción rápida sin salir del listado).

3. **Imágenes de productos**
   - **Subir archivo** desde el panel **o pegar una URL** (las dos opciones).

## 🔑 Login (opción elegida)

- Credenciales en `.env` del backend (`ADMIN_USER` / `ADMIN_PASSWORD`),
  fuera del código y **nunca subidas a GitHub**.
- `POST /api/admin/login` → devuelve un **token con expiración** (ej. 8 horas).
- El token se guarda en el navegador y se envía en `Authorization: Bearer`.
- **El backend valida siempre** en los endpoints admin: que `/admin` esté
  "escondido" en el footer no es seguridad (cualquiera puede escribir la URL).

## 🗒️ Endpoints que se agregarían (borrador)

- `POST /api/admin/login`
- `POST   /api/admin/products` (alta)
- `PUT    /api/admin/products/{id}` (editar precio/descripción/categoría)
- `POST   /api/admin/products/{id}/stock` (reponer stock)
- `DELETE /api/admin/products/{id}`
- `POST   /api/admin/products/{id}/image` (subida multipart) o guardar image URL

## ⚠️ Detalles técnicos a tener en cuenta

- La tabla `products` existente **no tiene la columna `image`**: hará falta una
  migración ligera (`ALTER TABLE ... ADD COLUMN`) porque `create_all()` **no**
  agrega columnas a tablas que ya existen.
- Guardar las imágenes en `backend/uploads/` (o `static/`) y servirlas con FastAPI.
- El `.env` debe estar en `.gitignore` (credenciales + secreto del token).

## 📅 Fases propuestas

1. **Login + token + endpoint protegido** (la puerta)
2. **Alta de productos + reponer stock** (lo esencial)
3. **Imágenes** (columna en la base + subida/URL)
4. **Extras**: editar/eliminar productos, badge "🔧 Modo admin" en el header,
   alertas de stock bajo, dashboard (pedidos del día, ingresos)

## 🎨 Extras opcionales (postergados)

- Badge "🔧 Modo admin" visible mientras dure la sesión + "Cerrar sesión"
- Alerta de stock bajo (ej. quedan menos de 5 unidades)
- Dashboard con métricas simples
