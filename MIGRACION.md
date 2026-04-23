# Paquete de Migración — Mini Web Servicios V1

**Fecha:** 22 de marzo de 2026  
**Checkpoint de origen:** `12739ba0`  
**Estado de tests:** 23/23 pasando

---

## 1. Stack exacto usado

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend framework | React | 19.2.1 |
| Routing cliente | Wouter | 3.3.5 (con patch custom) |
| Estilos | Tailwind CSS v4 | 4.1.14 |
| Componentes UI | Radix UI + shadcn/ui | múltiples |
| Animaciones | Framer Motion | 12.23.22 |
| Backend framework | Express | 4.21.2 |
| API layer | tRPC v11 | 11.6.0 |
| ORM | Drizzle ORM | 0.44.5 |
| Base de datos | MySQL (TiDB en Manus) | — |
| Driver DB | mysql2 | 3.15.0 |
| Auth | Manus OAuth (JWT HS256) | jose 6.1.0 |
| Storage de imágenes | Manus Forge Storage Proxy | — |
| Pagos | Mercado Pago REST API | (sin SDK, fetch directo) |
| Notificaciones | WhatsApp (implementación propia) | — |
| Serialización | SuperJSON | 1.13.3 |
| Build tool | Vite | 7.1.7 |
| Bundler servidor | esbuild | 0.25.0 |
| Runtime servidor | Node.js + tsx (dev) / node (prod) | — |
| Validación | Zod v4 | 4.1.12 |
| Testing | Vitest | 2.1.4 |
| Gestor de paquetes | pnpm | 10.4.1 |
| Lenguaje | TypeScript | 5.9.3 |

---

## 2. Estructura general del proyecto

```
mini-web-servicios-v1/
│
├── client/                     ← Frontend React (Vite root)
│   ├── index.html              ← HTML shell del SPA
│   ├── public/                 ← Archivos estáticos (favicon, robots.txt)
│   └── src/
│       ├── App.tsx             ← Rutas del SPA (Wouter)
│       ├── main.tsx            ← Providers (React Query, tRPC, Theme)
│       ├── index.css           ← Variables CSS globales, Tailwind
│       ├── const.ts            ← getLoginUrl(), constantes de cliente
│       ├── lib/
│       │   ├── trpc.ts         ← Cliente tRPC
│       │   └── utils.ts        ← cn() helper
│       ├── pages/
│       │   ├── Home.tsx        ← HOME PÚBLICA por slug (/:slug)
│       │   ├── Booking.tsx     ← FLUJO DE RESERVAS (/:slug/booking)
│       │   ├── BookingResult.tsx ← Resultado post-pago (success/failure/pending)
│       │   ├── Landing.tsx     ← Página técnica de entrada (/)
│       │   ├── NotFound.tsx    ← 404
│       │   └── admin/
│       │       ├── AdminProfile.tsx     ← ADMIN: perfil del negocio
│       │       ├── AdminServices.tsx    ← ADMIN: gestión de servicios
│       │       ├── AdminGallery.tsx     ← ADMIN: galería de imágenes
│       │       ├── AdminAvailability.tsx ← ADMIN: disponibilidad y fechas bloqueadas
│       │       └── AdminBookings.tsx    ← ADMIN: listado y gestión de reservas
│       ├── components/
│       │   ├── DashboardLayout.tsx  ← Layout del panel admin
│       │   └── ui/                  ← Componentes shadcn/ui
│       ├── contexts/
│       │   └── ThemeContext.tsx
│       └── hooks/
│
├── server/
│   ├── routers.ts              ← TODOS los procedimientos tRPC (business, services, bookings, payments, gallery, availability)
│   ├── db.ts                   ← Query helpers (Drizzle, funciones de acceso a BD)
│   ├── mercadopago.ts          ← Helpers de Mercado Pago (createPreference, getPaymentDetails, validateWebhook)
│   ├── whatsapp.ts             ← Notificaciones WhatsApp
│   ├── storage.ts              ← Helpers de storage (storagePut, storageGet) — DEPENDENCIA MANUS
│   ├── booking.test.ts         ← Tests de reservas, seguridad, multi-sitio
│   ├── auth.logout.test.ts     ← Tests de auth
│   ├── mercadopago.test.ts     ← Tests de MP (valida token real)
│   └── _core/                  ← Infraestructura del template (NO TOCAR)
│       ├── index.ts            ← Entry point del servidor Express
│       ├── env.ts              ← Centraliza process.env
│       ├── sdk.ts              ← Manus OAuth SDK — DEPENDENCIA MANUS
│       ├── oauth.ts            ← Rutas OAuth (/api/oauth/callback) — DEPENDENCIA MANUS
│       ├── context.ts          ← Contexto tRPC (req, res, user)
│       ├── trpc.ts             ← publicProcedure, protectedProcedure
│       ├── vite.ts             ← Integración Vite dev/prod
│       ├── notification.ts     ← notifyOwner() — DEPENDENCIA MANUS
│       └── ...otros helpers
│
├── drizzle/
│   ├── schema.ts               ← SCHEMA COMPLETO (tablas, tipos)
│   ├── relations.ts            ← Relaciones Drizzle
│   ├── 0000_*.sql              ← Migración 1: tabla users
│   ├── 0001_*.sql              ← Migración 2: tablas principales del negocio
│   ├── 0002_*.sql              ← Migración 3: campo slug en business_profile
│   └── meta/                   ← Metadata de Drizzle Kit
│
├── shared/
│   ├── const.ts                ← Constantes compartidas (COOKIE_NAME, timeouts)
│   └── types.ts                ← Tipos compartidos frontend/backend
│
├── drizzle.config.ts           ← Config de Drizzle Kit (dialect: mysql)
├── vite.config.ts              ← Config de Vite (incluye plugins Manus)
├── vitest.config.ts            ← Config de Vitest
├── tsconfig.json               ← TypeScript config
├── package.json                ← Dependencias y scripts
└── pnpm-lock.yaml              ← Lockfile
```

### Dónde está cada parte clave

| Parte | Archivo |
|---|---|
| Home pública | `client/src/pages/Home.tsx` |
| Flujo de reservas | `client/src/pages/Booking.tsx` |
| Resultado de pago | `client/src/pages/BookingResult.tsx` |
| Panel admin | `client/src/pages/admin/Admin*.tsx` |
| Lógica de pagos MP | `server/mercadopago.ts` + `server/routers.ts` (líneas 373–430) |
| Webhook MP | `server/_core/index.ts` (línea 39) + `server/routers.ts` (función `handleMercadoPagoWebhook`) |
| Schema de BD | `drizzle/schema.ts` |
| Variables de entorno | `server/_core/env.ts` (servidor) + `client/src/const.ts` (cliente) |
| Auth | `server/_core/sdk.ts` + `server/_core/oauth.ts` |
| Storage de imágenes | `server/storage.ts` |

---

## 3. Variables de entorno

### Variables del sistema (provistas por Manus, requieren reemplazo al salir)

| Variable | Para qué sirve | Obligatoria | Reemplazable |
|---|---|---|---|
| `DATABASE_URL` | Cadena de conexión MySQL/TiDB | Sí | Sí — cualquier MySQL |
| `JWT_SECRET` | Clave para firmar cookies de sesión (HS256) | Sí | Sí — string aleatorio largo |
| `VITE_APP_ID` | ID de la app en Manus OAuth | Sí | Reemplazar con propio sistema de auth |
| `OAUTH_SERVER_URL` | URL del servidor OAuth de Manus | Sí | Reemplazar con propio sistema de auth |
| `OWNER_OPEN_ID` | OpenID del dueño en Manus | Sí (para notificaciones) | Reemplazar o eliminar |
| `OWNER_NAME` | Nombre del dueño | No | Reemplazar o eliminar |
| `BUILT_IN_FORGE_API_URL` | URL del proxy de storage de Manus | Sí (para subir imágenes) | Reemplazar con S3/Cloudinary propio |
| `BUILT_IN_FORGE_API_KEY` | Token del proxy de storage de Manus | Sí (para subir imágenes) | Reemplazar con credenciales propias |
| `VITE_FRONTEND_FORGE_API_URL` | URL del Forge API para el frontend | No (no usado directamente) | Eliminar |
| `VITE_FRONTEND_FORGE_API_KEY` | Token del Forge API para el frontend | No (no usado directamente) | Eliminar |
| `VITE_OAUTH_PORTAL_URL` | URL del portal de login de Manus | Sí (para el botón de login) | Reemplazar con propio auth |
| `VITE_APP_TITLE` | Título de la app | No | Libre |
| `VITE_APP_LOGO` | URL del logo de la app | No | Libre |
| `VITE_ANALYTICS_ENDPOINT` | Endpoint de analytics de Manus | No | Eliminar |
| `VITE_ANALYTICS_WEBSITE_ID` | ID del sitio en analytics de Manus | No | Eliminar |

### Variables propias del proyecto (no provistas por Manus)

| Variable | Para qué sirve | Obligatoria | Ejemplo |
|---|---|---|---|
| `MERCADO_PAGO_ACCESS_TOKEN` | Token de acceso a la API de Mercado Pago | Sí (para pagos) | `APP_USR-xxx` (producción) o `TEST-xxx` (sandbox) |
| `PORT` | Puerto del servidor Express | No | `3000` |

### Archivo `.env.example` recomendado para uso fuera de Manus

```env
# Base de datos
DATABASE_URL=mysql://usuario:contraseña@host:3306/nombre_db

# Sesión
JWT_SECRET=un-string-aleatorio-largo-de-al-menos-32-caracteres

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxx  # o APP_USR-xxxx para producción

# Puerto (opcional)
PORT=3000

# Auth — REEMPLAZAR con sistema propio o dejar vacío si se elimina auth
VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=

# Storage — REEMPLAZAR con S3 propio
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=

# Owner (para notificaciones internas)
OWNER_OPEN_ID=
OWNER_NAME=
```

---

## 4. Base de datos

### Motor actual

El proyecto usa **MySQL** (en Manus se conecta a una instancia TiDB compatible con MySQL). El ORM es **Drizzle ORM** con `dialect: "mysql"` en `drizzle.config.ts`.

### Tablas del schema

| Tabla | Descripción |
|---|---|
| `users` | Usuarios autenticados (openId, nombre, email, rol) |
| `business_profile` | Perfil del negocio (nombre, slug, hero, descripción, contacto, redes) |
| `services` | Servicios del negocio (nombre, precio, duración, estado) |
| `service_availability` | Disponibilidad por día de la semana (horario, duración de turno) |
| `blocked_dates` | Fechas bloqueadas por el negocio |
| `bookings` | Reservas de clientes (servicio, fecha, hora, estado, pago) |
| `payment_transactions` | Transacciones de Mercado Pago (preferenceId, paymentId, estado) |
| `gallery_images` | Imágenes de la galería (URL en storage, orden) |
| `notifications` | Registro de notificaciones enviadas (WhatsApp, email) |

### Migraciones

Hay 3 archivos de migración SQL en `drizzle/`:

- `0000_sparkling_iron_monger.sql` — Crea la tabla `users`
- `0001_silly_gateway.sql` — Crea todas las tablas del negocio
- `0002_strong_kylun.sql` — Agrega el campo `slug` a `business_profile`

### Cómo replicar la estructura fuera de Manus

**Opción A — Aplicar migraciones SQL directamente:**

```bash
# Conectarse a la base de datos MySQL y ejecutar en orden:
mysql -u usuario -p nombre_db < drizzle/0000_sparkling_iron_monger.sql
mysql -u usuario -p nombre_db < drizzle/0001_silly_gateway.sql
mysql -u usuario -p nombre_db < drizzle/0002_strong_kylun.sql
```

**Opción B — Usar Drizzle Kit:**

```bash
# Con DATABASE_URL configurado en .env:
pnpm drizzle-kit migrate
```

### Datos demo / seed

No hay archivo de seed automatizado. Los datos de demo (negocio "Luna Masajes" y "Corte y Estilo") fueron cargados manualmente a través del panel admin y están en la base de datos de Manus. Para llevar esos datos fuera de Manus, habría que exportarlos con un dump MySQL desde el panel de base de datos de Manus.

### Qué hay que hacer para llevarla fuera de Manus

1. Crear una base de datos MySQL en el proveedor elegido (PlanetScale, Railway, Render, etc.)
2. Obtener la cadena de conexión `mysql://...`
3. Aplicar las 3 migraciones SQL en orden
4. Configurar `DATABASE_URL` en el nuevo entorno
5. Si se quieren los datos demo: exportar desde el panel DB de Manus y hacer un `mysql import`

### Algo específico del entorno Manus que hay que reemplazar

La cadena `DATABASE_URL` que provee Manus apunta a su instancia TiDB interna. Esa URL no funcionará fuera de Manus. Es la única dependencia de base de datos.

---

## 5. Storage / Imágenes

### Dónde se guardan hoy las imágenes

Las imágenes (hero del negocio, foto del profesional, galería) se suben al **Manus Forge Storage Proxy**, que es un servicio interno de Manus que actúa como intermediario de S3. El código está en `server/storage.ts`.

El flujo es:
1. El usuario sube la imagen desde el admin
2. El servidor llama a `storagePut(key, buffer, contentType)` en `server/storage.ts`
3. `storagePut` hace un POST a `BUILT_IN_FORGE_API_URL/v1/storage/upload` con Bearer token
4. El proxy devuelve una URL pública de la imagen (CDN de Manus)
5. Esa URL se guarda en la base de datos (`heroImageUrl`, `ownerImageUrl`, `gallery_images.url`)

### Qué parte depende del entorno Manus

`server/storage.ts` completo depende de Manus. Usa `BUILT_IN_FORGE_API_URL` y `BUILT_IN_FORGE_API_KEY`, que son credenciales del proxy interno de Manus. Fuera de Manus, esas variables no existen.

Las URLs de imágenes ya guardadas en la base de datos también apuntan al CDN de Manus. Si se migra la base de datos sin migrar las imágenes, las URLs seguirán funcionando mientras el proyecto esté activo en Manus, pero no hay garantía de permanencia a largo plazo.

### Qué habría que cambiar para usar storage propio fuera de Manus

`server/storage.ts` es el único archivo a reemplazar. La interfaz que exporta es simple:

```ts
storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType?: string): Promise<{ key: string; url: string }>
storageGet(relKey: string): Promise<{ key: string; url: string }>
```

Para migrar a S3 propio (AWS, Cloudflare R2, DigitalOcean Spaces), basta con reimplementar esas dos funciones usando `@aws-sdk/client-s3` (ya está en `package.json`) y configurar las credenciales correspondientes.

### ¿Está listo para Vercel en este punto?

**No directamente.** Vercel es serverless y no tiene sistema de archivos persistente. El upload de imágenes requiere un backend con estado (Express). La arquitectura actual (Express + tRPC) no es compatible con el modelo de funciones serverless de Vercel sin adaptación. Ver sección 9 para más detalle.

---

## 6. Mercado Pago

### Qué parte del flujo ya quedó funcionando

El flujo completo de pago fue validado con una transacción real de $100 ARS (Operación #151471183668):

1. Cliente completa el formulario de reserva → se crea una `booking` en BD con status `pending`
2. Frontend llama a `trpc.payments.createPreference` con `bookingId` y `slug`
3. El servidor valida que la reserva pertenezca al negocio del slug (seguridad cross-business)
4. El servidor llama a `POST https://api.mercadopago.com/checkout/preferences` con el token de acceso
5. MP devuelve un `init_point` (URL de checkout)
6. El frontend redirige al usuario a esa URL
7. El usuario paga en MP
8. MP llama al webhook `POST /api/webhooks/mercado-pago` con el resultado
9. El servidor actualiza la `booking` a status `confirmed` y la `payment_transaction` a `approved`
10. MP redirige al usuario a `/:slug/booking/success?bookingId=X`

### Variables que usa

| Variable | Uso |
|---|---|
| `MERCADO_PAGO_ACCESS_TOKEN` | Token de acceso para crear preferencias y consultar pagos. Puede ser `TEST-xxx` (sandbox) o `APP_USR-xxx` (producción) |

### Cómo está implementado el webhook

El webhook está registrado como ruta Express en `server/_core/index.ts` línea 39:

```
POST /api/webhooks/mercado-pago
```

La función `handleMercadoPagoWebhook` en `server/routers.ts` (línea ~529) recibe el body, extrae el `paymentId`, consulta los detalles del pago a MP, y actualiza la reserva y la transacción en la BD.

**Limitación conocida:** la validación de firma HMAC-SHA256 no está implementada completamente. En producción, el código solo verifica que el header `x-signature` esté presente, sin validar su contenido. Ver informe de seguridad para detalle.

### Qué URL habría que configurar cuando se despliegue fuera de Manus

En el panel de Mercado Pago → Configuración → Webhooks, hay que actualizar la URL de notificación a:

```
https://tu-dominio.com/api/webhooks/mercado-pago
```

Las URLs de retorno (`back_urls`) se configuran en el código en `server/routers.ts` al crear la preferencia. Actualmente usan la URL del negocio por slug. Habría que asegurarse de que apunten al dominio de producción correcto.

### Qué cambiaría al pasarlo a dominio/Vercel propio

- La URL del webhook en el panel de MP debe actualizarse al nuevo dominio
- Las `back_urls` en el código deben apuntar al nuevo dominio (actualmente se construyen dinámicamente, pero hay que verificar que la base URL sea correcta)
- El `MERCADO_PAGO_ACCESS_TOKEN` puede quedarse igual si es el mismo negocio
- Si se cambia de sandbox a producción (o viceversa), hay que cambiar el token

---

## 7. Dependencias del entorno Manus

Esta es la sección más importante para la migración. Se listan todas las dependencias identificadas directamente en el código.

### Dependencias críticas (rompen si no se reemplazan)

| Dependencia | Archivo | Impacto si no se reemplaza | Dificultad de reemplazo |
|---|---|---|---|
| **Manus OAuth** | `server/_core/sdk.ts`, `server/_core/oauth.ts`, `client/src/const.ts` | El login del admin no funciona. Nadie puede autenticarse. | Alta — requiere implementar un sistema de auth propio (NextAuth, Auth.js, Passport, o auth manual con JWT) |
| **Manus Storage Proxy** | `server/storage.ts` | No se pueden subir imágenes. Las ya subidas siguen visibles (URLs en BD) pero no se pueden agregar nuevas. | Media — reimplementar `storagePut`/`storageGet` con S3 propio (el SDK ya está en package.json) |
| **DATABASE_URL (TiDB interno)** | `server/db.ts` | La app no arranca sin una DB conectada. | Baja — cualquier MySQL funciona, solo cambiar la cadena de conexión |

### Dependencias no críticas (degradan funcionalidad pero no rompen el núcleo)

| Dependencia | Archivo | Impacto si no se reemplaza | Dificultad de reemplazo |
|---|---|---|---|
| **notifyOwner** | `server/_core/notification.ts` | Las notificaciones internas al dueño (vía Manus) no se envían. El resto funciona. | Baja — eliminar las llamadas o reemplazar con email/Slack |
| **vite-plugin-manus-runtime** | `vite.config.ts` línea 7 | El build falla si el paquete no está disponible fuera de Manus. | Baja — eliminar el plugin del `vite.config.ts` |
| **vitePluginManusDebugCollector** | `vite.config.ts` líneas 77–151 | Los logs de debug no se escriben. No afecta producción. | Baja — eliminar la función y su uso en el array de plugins |
| **jsxLocPlugin** | `vite.config.ts` línea 1 | Herramienta de desarrollo de Manus. No afecta producción. | Baja — eliminar el import y su uso |
| **VITE_ANALYTICS_*** | Variables de entorno | Analytics de Manus no funcionan. No afecta el producto. | Baja — eliminar las variables |
| **allowedHosts Manus** | `vite.config.ts` líneas 173–180 | En dev, el servidor Vite solo acepta hosts de Manus. Fuera de Manus, hay que agregar el propio dominio. | Baja — editar el array `allowedHosts` |

### Resumen de portabilidad

| Componente | ¿Portable hoy? | Acción necesaria |
|---|---|---|
| Frontend (React + Wouter + Tailwind) | Sí | Ninguna |
| Backend Express + tRPC | Sí | Ninguna |
| Drizzle ORM + schema | Sí | Solo cambiar `DATABASE_URL` |
| Lógica de reservas | Sí | Ninguna |
| Mercado Pago | Sí | Actualizar URL del webhook |
| WhatsApp | Sí | Ninguna (ya es independiente) |
| Auth (login admin) | No | Requiere reemplazar Manus OAuth |
| Storage de imágenes | No | Requiere reemplazar `server/storage.ts` |
| Vite build | Casi | Eliminar 3 plugins Manus del `vite.config.ts` |

---

## 8. Cómo correrlo localmente

### Requisitos previos

- Node.js 18 o superior
- pnpm (`npm install -g pnpm`)
- Una base de datos MySQL accesible (local o remota)

### Pasos

**1. Descomprimir y abrir el proyecto**

```bash
unzip mini-web-servicios-v1-export.zip
cd mini-web-servicios-v1
```

**2. Instalar dependencias**

```bash
pnpm install
```

**3. Crear el archivo `.env`**

Crear un archivo `.env` en la raíz del proyecto con las variables mínimas:

```env
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/mini_web_servicios
JWT_SECRET=un-string-aleatorio-de-al-menos-32-caracteres
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxx-tu-token-sandbox

# Estas variables son requeridas por el código actual pero pueden dejarse vacías
# si se elimina el sistema de auth de Manus (ver sección 7)
VITE_APP_ID=placeholder
OAUTH_SERVER_URL=placeholder
VITE_OAUTH_PORTAL_URL=placeholder
OWNER_OPEN_ID=placeholder
OWNER_NAME=placeholder

# Storage — dejar vacío si no se sube imágenes en local
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
```

**4. Crear la base de datos y aplicar migraciones**

```bash
# Opción A: SQL directo
mysql -u usuario -p nombre_db < drizzle/0000_sparkling_iron_monger.sql
mysql -u usuario -p nombre_db < drizzle/0001_silly_gateway.sql
mysql -u usuario -p nombre_db < drizzle/0002_strong_kylun.sql

# Opción B: Drizzle Kit
pnpm drizzle-kit migrate
```

**5. Levantar el servidor de desarrollo**

```bash
pnpm dev
```

El servidor arranca en `http://localhost:3000`.

**6. Verificar que quedó funcionando**

- `http://localhost:3000/` → Página técnica de entrada
- `http://localhost:3000/luna-masajes` → Home pública (requiere negocio con ese slug en BD)
- `http://localhost:3000/api/webhooks/health` → `{"status":"ok","timestamp":"..."}`
- `pnpm test` → 23 tests deben pasar (el test de MP requiere token válido)

---

## 9. Checklist de migración a VS Code + GitHub + Vercel

### Fase 1 — Preparación local

- [ ] 1. Descargar el ZIP del proyecto desde Manus
- [ ] 2. Descomprimir y abrir en VS Code
- [ ] 3. Ejecutar `pnpm install`
- [ ] 4. Crear `.env` con las variables mínimas (ver sección 3)
- [ ] 5. Crear base de datos MySQL (local o Railway/PlanetScale)
- [ ] 6. Aplicar las 3 migraciones SQL en orden
- [ ] 7. Ejecutar `pnpm dev` y verificar que arranca en `localhost:3000`
- [ ] 8. Verificar `GET /api/webhooks/health` → responde `{"status":"ok"}`
- [ ] 9. Ejecutar `pnpm test` → deben pasar los tests que no dependen de auth Manus

### Fase 2 — Limpieza de dependencias Manus (para deploy independiente)

- [ ] 10. Editar `vite.config.ts`: eliminar `vitePluginManusRuntime`, `vitePluginManusDebugCollector`, `jsxLocPlugin` del array de plugins y sus imports
- [ ] 11. Editar `vite.config.ts`: actualizar `allowedHosts` para incluir el dominio propio
- [ ] 12. Reemplazar `server/storage.ts` con implementación S3 propia (AWS, R2, DigitalOcean Spaces)
- [ ] 13. Reemplazar el sistema de auth: eliminar `server/_core/sdk.ts`, `server/_core/oauth.ts` y reemplazar con NextAuth, Auth.js, o auth manual con JWT
- [ ] 14. Actualizar `client/src/const.ts` para que `getLoginUrl()` apunte al nuevo sistema de auth
- [ ] 15. Eliminar o reemplazar `server/_core/notification.ts` (notificaciones internas de Manus)
- [ ] 16. Verificar que `pnpm build` termina sin errores
- [ ] 17. Verificar que `pnpm start` levanta el servidor de producción

### Fase 3 — GitHub

- [ ] 18. `git init` en la carpeta del proyecto
- [ ] 19. Crear `.gitignore` con al menos: `node_modules/`, `dist/`, `.env`, `.manus-logs/`, `.manus/`
- [ ] 20. `git add .` y `git commit -m "Mini Web Servicios V1 — migración inicial"`
- [ ] 21. Crear repositorio en GitHub (privado recomendado)
- [ ] 22. `git remote add origin https://github.com/usuario/repo.git`
- [ ] 23. `git push -u origin main`

### Fase 4 — Deploy (Railway o Render, no Vercel directo)

> **Importante:** Vercel no es compatible directamente con esta arquitectura. Ver sección 9 para detalle.

**Opción recomendada: Railway o Render**

- [ ] 24. Crear proyecto en Railway o Render
- [ ] 25. Conectar el repositorio de GitHub
- [ ] 26. Configurar todas las variables de entorno en el panel del proveedor
- [ ] 27. Verificar que el build (`pnpm build`) pasa en el entorno de CI
- [ ] 28. Verificar que el servidor arranca (`pnpm start`)
- [ ] 29. Probar `GET /api/webhooks/health` en el dominio de producción
- [ ] 30. Actualizar la URL del webhook en el panel de Mercado Pago
- [ ] 31. Probar el flujo completo de reserva y pago en producción
- [ ] 32. Configurar dominio personalizado si corresponde

---

## 10. Estado final honesto

### ¿El proyecto ya está listo para abrir en VS Code y correr local?

**Sí, con condiciones.** El código es válido TypeScript, los tests pasan, y la estructura es clara. Lo que se necesita para correr local:

1. Una base de datos MySQL (no incluida en el ZIP)
2. Un token de Mercado Pago (sandbox funciona)
3. Las variables de entorno mínimas en `.env`
4. Aceptar que el login del admin no va a funcionar sin Manus OAuth activo

Si el objetivo es solo revisar el código en VS Code, no hay ningún bloqueador. Si el objetivo es levantar el servidor completo con todas las funciones, el login del admin no va a funcionar sin reemplazar el sistema de auth.

### ¿Ya está listo para deploy en Vercel tal como está?

**No.** Hay dos razones concretas:

**Razón 1 — Arquitectura incompatible:** El proyecto es una aplicación Express monolítica que sirve tanto el frontend (SPA) como el backend (tRPC + webhooks) desde un único proceso Node.js. Vercel está diseñado para funciones serverless y sitios estáticos. Desplegar un servidor Express persistente en Vercel requiere adaptarlo a su modelo de Edge Functions o API Routes, lo que implica una refactorización significativa.

**Razón 2 — Dependencias Manus activas:** `vite-plugin-manus-runtime` en `vite.config.ts` puede fallar en un entorno de build externo si el paquete no está disponible en el registro de npm público. Hay que eliminarlo antes de cualquier build externo.

### ¿Qué ajustes mínimos faltan para salir de Manus sin romper nada?

En orden de prioridad:

1. **Limpiar `vite.config.ts`** — eliminar los 3 plugins Manus (30 minutos de trabajo)
2. **Reemplazar `server/storage.ts`** — reimplementar con S3 propio (2–4 horas)
3. **Reemplazar el sistema de auth** — este es el trabajo más grande (4–8 horas dependiendo de la solución elegida)
4. **Elegir el proveedor de deploy correcto** — Railway o Render en lugar de Vercel

### ¿Qué parte está más sensible en la migración?

**El sistema de autenticación.** Todo el panel admin depende de Manus OAuth. Los procedimientos `protectedProcedure` y `adminProcedure` verifican que el usuario esté autenticado a través del SDK de Manus. Sin reemplazar esa capa, el admin queda inaccesible.

La lógica de negocio (reservas, servicios, galería, disponibilidad, pagos) es completamente independiente de Manus y no requiere cambios para funcionar en otro entorno.

---

*Documento generado a partir de la auditoría directa del código del checkpoint `12739ba0`. Todos los números de línea, nombres de archivos y comportamientos descritos fueron verificados en el código real.*
