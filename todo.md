# Mini Web Servicios V1 - TODO

## Base de Datos & Backend
- [x] Esquema de base de datos: businessProfile, services, serviceAvailability, bookings, paymentTransactions, galleryImages
- [x] Migraciones SQL aplicadas
- [x] Helpers de BD en server/db.ts
- [x] Routers tRPC: businessProfile, services, availability, bookings, payments, gallery
- [x] Integración Mercado Pago sandbox (createPreference, webhook)
- [x] Integración WhatsApp (notificación post-pago)
- [x] Webhook endpoint para IPN de Mercado Pago

## Capa Pública
- [x] Sistema de diseño: colores, tipografía, tokens en index.css
- [x] Home: hero fuerte con imagen, nombre, frase, descripción, botones CTA
- [x] Home: sección "Quién soy / Presentación del negocio"
- [x] Home: sección de servicios destacados
- [x] Home: galería de fotos
- [x] Home: sección de contacto con WhatsApp
- [x] Home: navegación pública limpia
- [x] Flujo de reservas paso 1: selección de servicio
- [x] Flujo de reservas paso 2: selección de fecha y horario disponible
- [x] Flujo de reservas paso 3: datos del cliente + confirmación
- [x] Página post-pago: éxito (/booking/success)
- [x] Página post-pago: fallo (/booking/failure)
- [x] Página post-pago: pendiente (/booking/pending)

## Panel Admin
- [x] Ruta protegida /admin con autenticación
- [x] Admin: editor de perfil del negocio (nombre, frase, descripción, logo, portada)
- [x] Admin: gestión de servicios (crear, editar, eliminar)
- [x] Admin: configuración de disponibilidad horaria por día de semana
- [x] Admin: galería de fotos (subir, eliminar, reordenar)
- [x] Admin: listado de reservas con filtros por estado y fecha

## Tests
- [x] Tests unitarios: servicios
- [x] Tests unitarios: reservas
- [x] Tests unitarios: disponibilidad
- [x] Tests unitarios: pagos
- [x] Tests unitarios: perfil de negocio

## Realineación Visual
- [x] Análisis de Tienda Link: negro puro, sans-serif bold, sin dorado, editorial
- [x] Reescritura de Home.tsx con nueva estética
- [x] Reescritura de Booking.tsx con nueva estética
- [x] Reescritura de BookingResult.tsx con nueva estética
- [x] Reescritura de AdminLayout.tsx con nueva estética
- [x] Actualización de AdminProfile.tsx con nueva estética
- [x] Actualización de AdminBookings, AdminServices, AdminGallery, AdminAvailability
- [x] Eliminación completa de oklch navy/dorado y font-serif de todo el proyecto

## Multi-sitio por Slug
- [x] Agregar campo `slug` único a tabla business_profile en schema.ts
- [x] Migrar BD: agregar columna slug con índice único
- [x] Actualizar getPublicBusinessProfile(slug) para buscar por slug
- [x] Actualizar todos los endpoints públicos para recibir slug como parámetro
- [x] Actualizar rutas frontend: /:slug para home pública, /:slug/booking para reservas
- [x] Actualizar AdminLayout para asociar admin al negocio del usuario autenticado (no al primer negocio)
- [x] Crear 2 negocios demo distintos con slugs distintos para prueba funcional
- [x] Verificar aislamiento: servicios, galería, disponibilidad y reservas por negocio
- [x] Actualizar tests para cubrir resolución por slug

## Fix Ruta Raíz
- [x] Crear página de inicio en / que no devuelva 404

## Blindaje Técnico Núcleo
- [x] Slug inexistente: 404 real en frontend (Home, Booking) — no fallback genérico
- [x] Slug inexistente: error claro en backend (NOT_FOUND, no null silencioso)
- [x] Ownership: servicios.create/update/delete validan que el servicio pertenece al negocio del usuario
- [x] Ownership: galería.delete valida que la imagen pertenece al negocio del usuario
- [x] Ownership: disponibilidad.upsert valida que el businessId es del usuario autenticado
- [x] Ownership: reservas.updateStatus valida que la reserva pertenece al negocio del usuario
- [x] Flujo post-pago: BookingResult lee slug desde la reserva, no depende de ruta genérica
- [x] Flujo post-pago: botón "volver al negocio" usa el slug correcto
- [x] Limpiar restos del starter kit: páginas demo, rutas innecesarias, comentarios TODO
- [x] Tests actualizados para cubrir 404 por slug inexistente y ownership

## Ajuste de Enfoque — Ruta Raíz
- [x] Reescribir / como página técnica/neutra sin directorio público ni lenguaje de marketplace

## Blindaje Final — 2 Agujeros Técnicos
- [ ] bookings.getById: validar que bookingId + slug pertenecen al mismo negocio
- [ ] payments.createPreference: validar que booking.businessId === profile.id explícitamente

## Cierre V1 — Hero, Logo, Colores, Booking
- [x] Hero: agregar botón "Eliminar portada" en admin (setear heroImageUrl a null)
- [x] Hero: agregar endpoint removeImage en router para limpiar campo a null
- [x] Hero: cambiar fallback de Unsplash (peluquería) a fallback neutro oscuro sin imagen externa
- [x] Logo: quitar campo logo del admin (no se usa en capa pública, promesa falsa)
- [x] Logo: quitar logoUrl del schema de update (o dejarlo oculto sin UI)
- [x] Colores: quitar campos primaryColor y accentColor del admin (no se aplican en capa pública)
- [x] Booking: corregir hueco gris en grid de servicios con cantidad impar
