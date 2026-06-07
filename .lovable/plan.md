Voy a ejecutarlo en una sola tanda, pero algunas piezas quedarán “v1 funcional” y se irán puliendo después. Esto es lo que entrego y dónde voy a cortar para no inflar la entrega.

## 1. Avisos San Antonio (visible en toda la web)

- Copio `Avisos_Bus_San_Antonio.pdf` y `Servicio_Especial_fiestas.pdf` desde tus uploads a `public/avisos/`.
- En `/avisos/san-antonio` añado dos botones grandes: “Abrir aviso oficial (PDF)” y “Servicio especial de fiestas (PDF)” + un botón “Descargar” cada uno.
- Reemplazo `SanAntonioBanner` por un **banner rodante horizontal** (marquee CSS) con texto resumido y enlace a `/avisos/san-antonio`. Aparece en home, `/app`, y en el resto de páginas mediante un wrapper en `__root.tsx` (auto-oculto tras 19 junio 2026 y dismiss persistente).
- Enlace destacado “⚠ Avisos San Antonio” en menú principal y en el footer global.

## 2. Avisos por parada (mapa + listado + tarjeta)

- Creo `src/lib/sanAntonio.ts` con: lista de stop IDs suspendidos, stop IDs con recorrido modificado, y stops del Búho Fiestas (Calle Picones 15 / Glorieta del Cañazo) con sus horarios por día.
- Añado componente `<StopSanAntonioNotice stopId="…" />` que renderiza badge naranja “Parada suspendida 10–14 jun” o “Recorrido modificado” o tabla compacta de horarios Búho Fiestas según el caso.
- Lo inserto en: tarjetas del listado de paradas, popup del mapa (`BusMap.tsx`) y nueva subpágina `/parada/$slug`.

## 3. Subpáginas `/parada/$slug`

- Slugs derivados del nombre (ej. `clavel-casa-de-cultura`). Build de un mapa `slug → stopId` en `src/data/stop-slugs.ts` (generado una vez con script).
- Página con: nombre, descripción, mapa Google embebido + Street View (iframe con `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY`), botón “Abrir en Google Maps” (link `https://www.google.com/maps/dir/?api=1&destination=lat,lon`), próximos buses en vivo (reutiliza `fetchStopArrivals`), horario completo del día (extraído de `schedule.json` con selector de día), aviso San Antonio si aplica.
- Las rutas existentes (`/app`, listado) enlazan a estas subpáginas.

## 4. Selector de horario diario en cada parada

- En la subpágina y en el popup del listado añado un selector L–D que muestra todas las salidas del día desde `schedule.json` para esa parada, agrupadas por línea.

## 5. Telegram

- El bot ya consume `fetchStopArrivals`, así que la info San Antonio aparece automáticamente.
- Añado en el formato del bot un aviso fijo “⚠ Fiestas San Antonio – más info: arroyobus.lovable.app/avisos/san-antonio” hasta el 20 junio.
- Comando `/parada <id>` ya enlazará a la nueva subpágina pública.

## 6. `/admin` editable (un solo admin: tú)

Nueva tabla `app_settings(key text primary key, value jsonb, updated_at timestamptz)` con RLS deny-all (solo accesible vía service-role desde server fns ya protegidas por `requireAdmin`). Edito desde `/admin`:

- URL del feed GTFS-RT (override del proxy ActioSAE).
- URL del GTFS static (uploader/URL).
- Texto del banner San Antonio.
- Link del bot Telegram (default `https://t.me/arroyobus_bot`) + botón “Abrir bot” que abre `t.me/arroyobus_bot`.
- Sección **Secrets** con campos para reescribir (vía `secrets--update_secret` flow, pero como ese tool requiere intervención de usuario, en `/admin` muestro botón “Rotar / actualizar” que abre el diálogo de secret en Lovable Cloud — los valores reales NO se guardan en la DB).
- Atajos a conectores (Google Maps, Search Console) con estado.

## 7. Google Maps Platform + Google Search Console

- Maps: ya está la browser key disponible; configuro los embeds y geocoding via gateway donde haga falta.
- Search Console: ejecuto el flujo META (token → meta tag en `__root.tsx` → verify → add site) para `https://arroyobus.lovable.app/`.

## 8. Badge “personas viendo ahora” (home)

- Hook `usePresenceCount()` usando Supabase Realtime Presence en canal `arroyobus-home`. Muestra “👀 N viendo ahora” en la home (esquina o bajo el hero).

## 9. Arreglo de “Security”

- Ejecuto `security--run_security_scan`, corrijo lo que aparezca (probablemente RLS faltante en nueva tabla `app_settings` ya cubierto, y actualizo `security-memory`).

## Recortes conscientes

- El editor de secrets en `/admin` NO reescribe los valores reales en Lovable Cloud (eso requiere tu confirmación manual); el panel los enlaza y muestra last-updated.
- La generación del mapa slug↔stop es estática (no admin), si cambias `stops.json` se regenera al hacer build.
- Street View se embebe como iframe estático centrado en lat/lon (sin selector de heading manual).

## Archivos clave

- Nuevos: `src/components/MarqueeBanner.tsx`, `src/components/StopSanAntonioNotice.tsx`, `src/components/PresenceBadge.tsx`, `src/lib/sanAntonio.ts`, `src/data/stop-slugs.ts`, `src/routes/parada/$slug.tsx`, `src/lib/admin/settings.functions.ts`, migración `app_settings`.
- Editados: `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/app.tsx`, `src/routes/avisos.san-antonio.tsx`, `src/routes/admin.tsx`, `src/components/BusMap.tsx`, `src/components/SanAntonioBanner.tsx` (lo convierto en marquee), `src/lib/telegram/format.ts`, `public/avisos/*.pdf`.

¿Le doy?
