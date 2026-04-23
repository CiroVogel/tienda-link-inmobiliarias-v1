# Arquitectura — Mini Web Servicios V1

**Estado:** post-limpieza de plugins Manus  
**Checkpoint:** `2e292c8c`  
**Fecha:** 23 de marzo de 2026  
**Tests:** 23/23 pasando · TypeScript: sin errores · Build: OK

---

## 1. Visión general

Mini Web Servicios V1 es una aplicación web monolítica que sirve como mini web comercial para negocios de servicios individuales (masajistas, peluqueras, manicuras, tatuadores). El modelo es **multi-sitio por slug**: un único servidor atiende a múltiples negocios, cada uno accesible bajo su propio slug (`/luna-masajes`, `/corte-y-estilo`). No hay marketplace ni directorio público.

La arquitectura es un **monolito Express** que sirve tanto el frontend (SPA React compilado por Vite) como el backend (API tRPC) desde un único proceso Node.js. En desarrollo, Vite corre como middleware dentro del mismo proceso. En producción, el frontend se sirve como archivos estáticos desde `dist/public/`.

```
Cliente (browser)
       │
       ├── GET /:slug          → SPA React (Wouter routing)
       ├── POST /api/trpc/*    → tRPC procedures (Express middleware)
       ├── GET /api/oauth/callback → Manus OAuth callback
       └── POST /api/webhooks/mercado-pago → Webhook handler (Express route)
```

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión | Notas |
|---|---|---|---|
| Frontend | React | 19.2.1 | SPA, sin SSR |
| Routing cliente | Wouter | 3.3.5 | con patch custom |
| Estilos | Tailwind CSS v4 | 4.1.14 | — |
| Componentes UI | Radix UI + shadcn/ui | múltiples | — |
| Animaciones | Framer Motion | 12.23.22 | — |
| Backend | Express | 4.21.2 | — |
| API layer | tRPC v11 | 11.6.0 | sin REST, sin Axios |
| ORM | Drizzle ORM | 0.44.5 | dialect: mysql |
| Base de datos | MySQL (TiDB en Manus) | — | — |
| Driver DB | mysql2 | 3.15.0 | — |
| Auth | Manus OAuth + JWT HS256 | jose 6.1.0 | **dependencia Manus** |
| Storage | Manus Forge Proxy | — | **dependencia Manus** |
| Pagos | Mercado Pago REST API | — | fetch directo, sin SDK |
| Notificaciones | WhatsApp (implementación propia) | — | — |
| Serialización | SuperJSON | 1.13.3 | fechas como Date en tRPC |
| Build frontend | Vite | 7.1.7 | sin plugins Manus |
| Build backend | esbuild | 0.25.0 | bundle para producción |
| Validación | Zod v4 | 4.1.12 | cliente y servidor |
| Testing | Vitest | 2.1.4 | — |
| Gestor paquetes | pnpm | 10.4.1 | — |
| Lenguaje | TypeScript | 5.9.3 | strict mode |

---

## 3. Estructura de carpetas

```
mini-web-servicios-v1/
│
├── client/                        ← Vite root (frontend)
│   ├── index.html                 ← HTML shell del SPA
│   ├── public/                    ← Archivos estáticos (favicon, robots.txt)
│   └── src/
│       ├── App.tsx                ← Árbol de rutas (Wouter)
│       ├── main.tsx               ← Providers (QueryClient, tRPC, Theme)
│       ├── index.css              ← Variables CSS globales, Tailwind base
│       ├── const.ts               ← getLoginUrl(), constantes de cliente
│       ├── lib/
│       │   ├── trpc.ts            ← Cliente tRPC tipado (AppRouter)
│       │   └── utils.ts           ← cn() helper
│       ├── pages/
│       │   ├── Home.tsx           ← Home pública por slug
│       │   ├── Booking.tsx        ← Flujo de reservas (4 pasos)
│       │   ├── BookingResult.tsx  ← Resultado post-pago
│       │   ├── Landing.tsx        ← Página técnica de entrada (/)
│       │   ├── NotFound.tsx       ← 404
│       │   └── admin/
│       │       ├── AdminProfile.tsx      ← Perfil del negocio
│       │       ├── AdminServices.tsx     ← Gestión de servicios
│       │       ├── AdminGallery.tsx      ← Galería de imágenes
│       │       ├── AdminAvailability.tsx ← Disponibilidad y fechas bloqueadas
│       │       └── AdminBookings.tsx     ← Listado y gestión de reservas
│       ├── components/
│       │   ├── DashboardLayout.tsx  ← Layout del panel admin (sidebar)
│       │   └── ui/                  ← Componentes shadcn/ui (Radix)
│       ├── contexts/
│       │   └── ThemeContext.tsx
│       └── hooks/
│
├── server/
│   ├── routers.ts               ← Todos los procedimientos tRPC
│   ├── db.ts                    ← Query helpers (Drizzle)
│   ├── mercadopago.ts           ← Helpers de Mercado Pago
│   ├── whatsapp.ts              ← Notificaciones WhatsApp
│   ├── storage.ts               ← Helpers de storage (dependencia Manus)
│   ├── booking.test.ts          ← Tests de reservas, seguridad, multi-sitio
│   ├── auth.logout.test.ts      ← Tests de auth
│   ├── mercadopago.test.ts      ← Tests de MP (valida token real)
│   └── _core/                   ← Infraestructura del template
│       ├── index.ts             ← Entry point Express
│       ├── env.ts               ← Centraliza process.env
│       ├── sdk.ts               ← Manus OAuth SDK (dependencia Manus)
│       ├── oauth.ts             ← Ruta /api/oauth/callback (dependencia Manus)
│       ├── context.ts           ← Contexto tRPC (req, res, user)
│       ├── trpc.ts              ← publicProcedure, protectedProcedure
│       ├── vite.ts              ← Integración Vite dev/prod
│       ├── notification.ts      ← notifyOwner() (dependencia Manus)
│       └── systemRouter.ts      ← Procedimiento system.notifyOwner
│
├── drizzle/
│   ├── schema.ts                ← Schema completo (9 tablas, tipos)
│   ├── relations.ts             ← Relaciones Drizzle
│   ├── 0000_*.sql               ← Migración 1: tabla users
│   ├── 0001_*.sql               ← Migración 2: tablas del negocio
│   └── 0002_*.sql               ← Migración 3: campo slug
│
├── shared/
│   ├── const.ts                 ← COOKIE_NAME, timeouts, mensajes de error
│   └── types.ts                 ← Re-exporta tipos del schema
│
├── vite.config.ts               ← Config Vite (limpia, sin plugins Manus)
├── drizzle.config.ts            ← Config Drizzle Kit (dialect: mysql)
├── vitest.config.ts             ← Config Vitest
├── tsconfig.json                ← TypeScript config
├── package.json                 ← Dependencias y scripts
└── MIGRACION.md                 ← Guía técnica de migración
```

---

## 4. Rutas del sistema

### 4.1 Rutas públicas (frontend — Wouter)

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Landing.tsx` | Página técnica de entrada. Acceso por slug y link al admin. |
| `/:slug` | `Home.tsx` | Home pública del negocio. Hero, presentación, servicios, galería, contacto. |
| `/:slug/booking` | `Booking.tsx` | Flujo de reservas en 4 pasos: servicio → fecha/hora → datos → pago. |
| `/:slug/booking/success` | `BookingResult.tsx` | Resultado post-pago: aprobado. |
| `/:slug/booking/failure` | `BookingResult.tsx` | Resultado post-pago: rechazado. |
| `/:slug/booking/pending` | `BookingResult.tsx` | Resultado post-pago: pendiente. |
| `/404` | `NotFound.tsx` | Página 404 explícita. |

### 4.2 Rutas del panel admin (frontend — Wouter)

| Ruta | Componente | Descripción |
|---|---|---|
| `/admin` | `AdminBookings.tsx` | Listado y gestión de reservas. |
| `/admin/profile` | `AdminProfile.tsx` | Perfil del negocio (nombre, slug, hero, descripción, contacto). |
| `/admin/services` | `AdminServices.tsx` | Gestión de servicios (crear, editar, eliminar). |
| `/admin/gallery` | `AdminGallery.tsx` | Galería de imágenes (subir, eliminar, reordenar). |
| `/admin/availability` | `AdminAvailability.tsx` | Disponibilidad semanal y fechas bloqueadas. |

### 4.3 Rutas del servidor (Express)

| Ruta | Tipo | Descripción |
|---|---|---|
| `/api/trpc/*` | tRPC middleware | Todos los procedimientos de la API. |
| `/api/oauth/callback` | GET Express | Callback de Manus OAuth. Crea sesión y redirige a `/`. |
| `/api/webhooks/mercado-pago` | POST Express | Recibe notificaciones de pago de MP. Actualiza estado de reserva. |
| `/api/webhooks/health` | GET Express | Health check del servidor. |

---

## 5. Capa de API — procedimientos tRPC

El contrato entre frontend y backend está definido exclusivamente en `server/routers.ts`. El cliente consume los procedimientos a través de `trpc.*` hooks (React Query bajo el capó). No hay endpoints REST, no hay Axios.

### 5.1 Procedimientos públicos (`publicProcedure`)

Accesibles sin autenticación. Todos los que operan sobre datos de un negocio requieren `slug` como parámetro obligatorio para garantizar el aislamiento multi-sitio.

| Procedimiento | Tipo | Descripción |
|---|---|---|
| `auth.me` | query | Devuelve el usuario autenticado o `null`. |
| `auth.logout` | mutation | Limpia la cookie de sesión. |
| `business.getPublic` | query | Perfil público del negocio por slug. |
| `business.listAll` | query | Lista todos los negocios con slug configurado. |
| `services.listPublic` | query | Servicios activos del negocio por slug. |
| `availability.getPublic` | query | Disponibilidad semanal del negocio por slug. |
| `availability.getBookedSlots` | query | Horarios ya reservados para una fecha y slug. |
| `bookings.create` | mutation | Crea una reserva. Requiere slug para asociar al negocio correcto. |
| `bookings.getById` | query | Detalle de una reserva. Requiere slug + bookingId. Valida cross-business. |
| `payments.createPreference` | mutation | Crea preferencia de pago en MP. Valida cross-business. |
| `payments.getByBookingId` | query | Estado del pago de una reserva. |

### 5.2 Procedimientos protegidos (`adminProcedure`)

Requieren sesión válida **y** `role === "admin"`. Todos los procedimientos de escritura incluyen validación de ownership: verifican que el recurso pertenezca al negocio del usuario autenticado antes de ejecutar la operación.

| Procedimiento | Tipo | Descripción |
|---|---|---|
| `business.get` | query | Perfil del negocio del usuario autenticado. |
| `business.update` | mutation | Actualiza el perfil del negocio. |
| `business.uploadImage` | mutation | Sube imagen (hero, logo, foto profesional) al storage. |
| `business.removeImage` | mutation | Elimina imagen del perfil. |
| `services.list` | query | Lista todos los servicios del negocio. |
| `services.create` | mutation | Crea un servicio. |
| `services.update` | mutation | Actualiza un servicio. Valida ownership. |
| `services.delete` | mutation | Elimina un servicio. Valida ownership. |
| `availability.get` | query | Disponibilidad del negocio. |
| `availability.upsert` | mutation | Actualiza disponibilidad de un día. |
| `availability.getBlockedDates` | query | Fechas bloqueadas del negocio. |
| `bookings.list` | query | Lista todas las reservas con nombre del servicio. |
| `bookings.updateStatus` | mutation | Cambia el estado de una reserva. Valida ownership. |
| `gallery.list` | query | Imágenes de la galería. |
| `gallery.upload` | mutation | Sube imagen al storage y la registra en BD. |
| `gallery.delete` | mutation | Elimina imagen. Valida ownership. |
| `gallery.reorder` | mutation | Reordena imágenes. Valida ownership de todas. |

---

## 6. Modelo de datos

El schema está definido en `drizzle/schema.ts` usando Drizzle ORM con `dialect: "mysql"`. Hay 9 tablas.

```
users ──────────────────────────────────────────────────────────────────
  id, openId (unique), name, email, loginMethod, role, timestamps

business_profile ───────────────────────────────────────────────────────
  id, userId (→ users.id), slug (unique)
  identidad: businessName, tagline, description
  profesional: ownerName, ownerTitle, ownerBio, ownerImageUrl
  imágenes: logoUrl, heroImageUrl
  contacto: phone, whatsapp, email, address
  redes: instagram, facebook
  config: primaryColor, accentColor, depositPercentage, currency
  timestamps

services ───────────────────────────────────────────────────────────────
  id, businessId (→ business_profile.id)
  name, description, price (decimal), duration (minutos)
  isActive, sortOrder, timestamps

service_availability ───────────────────────────────────────────────────
  id, businessId (→ business_profile.id)
  dayOfWeek (0=Dom..6=Sáb), startTime, endTime
  slotDuration (minutos), isActive, timestamps

blocked_dates ──────────────────────────────────────────────────────────
  id, businessId (→ business_profile.id)
  date (YYYY-MM-DD), reason, createdAt

bookings ───────────────────────────────────────────────────────────────
  id, businessId (→ business_profile.id), serviceId (→ services.id)
  clientName, clientEmail, clientPhone
  bookingDate (YYYY-MM-DD), bookingTime (HH:MM)
  status: pending | confirmed | cancelled | completed
  totalAmount, depositAmount, paymentType: deposit | full
  notes, timestamps

payment_transactions ───────────────────────────────────────────────────
  id, bookingId (→ bookings.id)
  preferenceId, paymentId, externalReference
  status: pending | approved | rejected | cancelled | refunded
  amount, currency, rawData (JSON), timestamps

gallery_images ─────────────────────────────────────────────────────────
  id, businessId (→ business_profile.id)
  url, fileKey, caption, sortOrder, isActive, createdAt

notifications ──────────────────────────────────────────────────────────
  id, bookingId (→ bookings.id)
  type: booking_confirmation | payment_confirmation | reminder_24h | booking_cancelled
  channel: whatsapp | email
  recipient, message, status: sent | failed | pending
  sentAt, createdAt
```

### Relaciones clave

Cada `business_profile` pertenece a un `user` (1:1 por diseño actual). Todos los recursos del negocio (`services`, `bookings`, `gallery_images`, `service_availability`, `blocked_dates`) referencian `businessId`. El aislamiento multi-sitio se garantiza resolviendo siempre el `businessId` a partir del `slug` antes de cualquier operación.

---

## 7. Flujo de reserva y pago

El flujo completo fue validado con una transacción real de $100 ARS (Operación #151471183668).

```
1. Cliente visita /:slug
   └── trpc.business.getPublic(slug) → perfil del negocio
   └── trpc.services.listPublic(slug) → lista de servicios

2. Cliente inicia reserva en /:slug/booking
   └── Paso 1: selecciona servicio
   └── Paso 2: selecciona fecha y horario
       └── trpc.availability.getPublic(slug) → días disponibles
       └── trpc.availability.getBookedSlots(slug, date) → horarios ocupados
   └── Paso 3: completa datos personales
   └── Paso 4: confirma y paga
       └── trpc.bookings.create(slug, ...) → crea booking (status: pending)
       └── trpc.payments.createPreference(slug, bookingId, ...) → crea preferencia MP
           └── Valida cross-business: booking.businessId === profile.id
           └── POST https://api.mercadopago.com/checkout/preferences
           └── Devuelve init_point (URL de checkout MP)
       └── Frontend redirige a init_point

3. Usuario paga en Mercado Pago
   └── MP llama POST /api/webhooks/mercado-pago
       └── handleMercadoPagoWebhook()
       └── GET https://api.mercadopago.com/v1/payments/:id
       └── updatePaymentStatus(preferenceId, "approved", paymentId)
       └── updateBookingStatus(bookingId, "confirmed")
       └── sendWhatsAppMessage(clientPhone, confirmationMessage)
   └── MP redirige a /:slug/booking/success?bookingId=X

4. Cliente ve página de confirmación
   └── trpc.bookings.getById(id, slug) → detalle de la reserva
       └── Valida cross-business: booking.businessId === profile.id
```

---

## 8. Seguridad

El modelo de seguridad tiene tres capas:

**Capa 1 — Autenticación:** `protectedProcedure` verifica que la cookie de sesión sea válida (JWT HS256 firmado con `JWT_SECRET`). Si no hay sesión válida, devuelve `UNAUTHORIZED`.

**Capa 2 — Autorización por rol:** `adminProcedure` extiende `protectedProcedure` y verifica que `ctx.user.role === "admin"`. Si el rol no coincide, devuelve `FORBIDDEN`.

**Capa 3 — Ownership:** Cada procedimiento de escritura verifica que el recurso a modificar pertenezca al negocio del usuario autenticado (`recurso.businessId !== profile.id` → `FORBIDDEN`). Aplica a `services.update`, `services.delete`, `bookings.updateStatus`, `gallery.delete`, `gallery.reorder`.

**Aislamiento cross-business:** Los endpoints públicos `bookings.getById` y `payments.createPreference` requieren tanto `bookingId` como `slug`, y verifican explícitamente que `booking.businessId === profile.id` antes de devolver datos o crear pagos.

**Validación de slug:** El `slugSchema` (`/^[a-z0-9-]+$/`) valida el formato antes de cualquier consulta a la base de datos.

---

## 9. Dependencias del entorno Manus

Esta sección documenta honestamente qué partes del proyecto siguen acopladas a Manus después de la limpieza de plugins.

| Componente | Archivo | Impacto al salir | Reemplazable |
|---|---|---|---|
| **Auth (login admin)** | `server/_core/sdk.ts`, `server/_core/oauth.ts` | El admin queda inaccesible sin reemplazar | Sí — NextAuth, Auth.js, o JWT manual |
| **Storage de imágenes** | `server/storage.ts` | No se pueden subir imágenes nuevas | Sí — S3 propio (SDK ya en package.json) |
| **DATABASE_URL (TiDB)** | `server/db.ts` | La app no arranca sin DB conectada | Sí — cualquier MySQL |
| **notifyOwner** | `server/_core/notification.ts` | Notificaciones internas al dueño no se envían | Sí — eliminar o reemplazar con email |

Lo que **ya no depende de Manus** después de la limpieza de `vite.config.ts`:

- El build de producción (`pnpm build`) corre en cualquier entorno Node.js
- El servidor Express (`pnpm start`) no requiere ningún servicio de Manus para arrancar
- La lógica de reservas, servicios, galería, disponibilidad y pagos es completamente independiente
- Los tests corren sin conexión a ningún servicio de Manus (excepto el test de MP que valida el token)

---

## 10. Scripts disponibles

| Script | Comando | Descripción |
|---|---|---|
| `dev` | `NODE_ENV=development tsx watch server/_core/index.ts` | Servidor de desarrollo con hot reload |
| `build` | `vite build && esbuild server/_core/index.ts ...` | Build de producción (frontend + backend) |
| `start` | `NODE_ENV=production node dist/index.js` | Servidor de producción |
| `check` | `tsc --noEmit` | Verificación TypeScript |
| `test` | `vitest run` | Suite de tests (23 tests) |
| `db:push` | `drizzle-kit generate && drizzle-kit migrate` | Genera y aplica migraciones |

---

## 11. Variables de entorno requeridas

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión MySQL |
| `JWT_SECRET` | Sí | Clave para firmar cookies de sesión |
| `MERCADO_PAGO_ACCESS_TOKEN` | Sí (para pagos) | Token MP (`TEST-*` o `APP_USR-*`) |
| `VITE_APP_ID` | Sí (para auth Manus) | ID de la app en Manus OAuth |
| `OAUTH_SERVER_URL` | Sí (para auth Manus) | URL del servidor OAuth de Manus |
| `VITE_OAUTH_PORTAL_URL` | Sí (para auth Manus) | URL del portal de login de Manus |
| `BUILT_IN_FORGE_API_URL` | Sí (para storage) | URL del proxy de storage de Manus |
| `BUILT_IN_FORGE_API_KEY` | Sí (para storage) | Token del proxy de storage de Manus |
| `OWNER_OPEN_ID` | No | OpenID del dueño (para notificaciones internas) |
| `PORT` | No | Puerto del servidor (default: 3000) |

---

*Documento generado a partir de la auditoría directa del código del checkpoint `2e292c8c`. Todos los nombres de archivos, procedimientos y comportamientos fueron verificados en el código real.*
