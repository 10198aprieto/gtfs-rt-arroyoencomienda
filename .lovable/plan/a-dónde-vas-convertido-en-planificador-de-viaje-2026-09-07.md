# "¿A dónde vas?" convertido en planificador de viaje

Hoy el buscador de la portada solo encuentra paradas y direcciones, y como mucho te lleva a la parada más cercana al destino. El objetivo: escribes un sitio ("Plaza Mayor", "Calle Zorrilla 120", "Hospital Río Hortega") y la app te dice, desde donde estás, en qué parada subir, qué bus coger, dónde bajarte y —si el destino está en Valladolid capital— qué línea de Auvasa enlazar después.

## Lo que verá el usuario

1. Campo **"¿A dónde vas?"** con sugerencias mezcladas: paradas de ArroyoBus, calles y lugares (OpenStreetMap, ya en marcha, con más resultados y mejor orden).
2. Campo de **origen** debajo, relleno con "Mi ubicación" y editable (puedes escribir otra dirección).
3. Al elegir destino aparece una **tarjeta de viaje**:
  - 🚶 Camina X min hasta la parada *Nombre (nº)*
  - 🔵 Coge la *Línea Azul* — sale en *7 min* (en vivo si hay dato, horario si no)
  - 🚏 Bájate en *Parada destino*
  - 🔁 (si aplica) Enlaza con la *línea 7 de Auvasa* en *Parada X* y bájate en *Parada Y*
  - 🚶 Camina Z min hasta tu destino · hora estimada de llegada
4. Hasta 3 alternativas ordenadas por hora de llegada, y un mapa con el recorrido y los puntos de subida/bajada.
5. Si no hay ninguna combinación razonable, mensaje claro con la parada más cercana al destino (comportamiento actual como respaldo).

## Datos

- **ArroyoBus**: ya tenemos `src/data/stops.json` y `src/data/schedule.json`. Se reconstruyen las secuencias de cada viaje agrupando por `tripId` y ordenando por hora, para saber qué paradas van antes y después.
- **Auvasa (Valladolid)**: GTFS oficial verificado y descargable en `http://212.170.201.204:50080/GTFSRTapi/api/gtfsfile` (582 paradas, 59 líneas, 7.424 viajes). Un script de generación lo convierte en ficheros compactos: paradas, patrones de línea (orden de paradas + minutos entre ellas) y horas de salida por viaje. Nada de esto se envía al navegador: vive en el servidor.
- Los datos de Auvasa se regeneran con un comando cuando cambien (igual que hoy con el GTFS de La Regional).

## Detalles técnicos

- `scripts/gen-auvasa.mjs`: descarga y descomprime el GTFS de Auvasa, y escribe `src/data/auvasa/stops.json`, `patterns.json` (route_id + direction + secuencia de paradas + offsets acumulados) y `trips.json` (patrón, service_id, hora de salida). `calendar_dates.txt` define los días de servicio (no hay `calendar.txt` útil).
- `src/lib/planner/graph.server.ts`: índices en memoria (cacheados por instancia) de paradas ArroyoBus + Auvasa, patrones y viajes; función `nearbyStops(lat, lon, radio)` con haversine.
- `src/lib/planner/plan.server.ts`: búsqueda por tiempo de llegada
  1. paradas de origen a ≤900 m y paradas de destino a ≤900 m;
  2. viajes directos (mismo patrón, orden de paradas correcto) en cualquiera de las dos redes;
  3. un transbordo: parada de bajada de ArroyoBus a ≤350 m de una parada de Auvasa (y viceversa) — así se resuelve "voy a Valladolid";
  4. coste = caminar (4,5 km/h) + espera + trayecto; se devuelven las 3 mejores.
- Primera pierna con datos en vivo: se reutiliza `fetch-arrivals.ts` para sustituir la hora teórica por la real cuando la parada es de ArroyoBus.
- `src/lib/planner/plan.functions.ts`: `planTrip` como `createServerFn` (POST) con validación Zod de `{ from: {lat,lon} | texto, to: {lat,lon} | texto }`. La geocodificación de texto se hace en el servidor (Nominatim con cabecera de identificación y caché corta) para no depender del navegador.
- UI: nuevo `src/components/TripPlanner.tsx` usado dentro de `Dashboard.tsx` (sustituye al bloque de búsqueda actual, conservando el listado de paradas), con `useQuery` y estados de carga/vacío. Colores de línea desde `src/data/routes.ts`; para Auvasa se usa `route_color` del propio GTFS.
- El mapa del itinerario reutiliza `BusMap.tsx` con importación dinámica (Leaflet no puede cargarse en servidor).

## Fuera de alcance

- Horarios en vivo de Auvasa (solo horario teórico en la segunda pierna).
- Más de un transbordo.  
  
Avisar de que, en los autobuses urbanos de Valladolid, NO SIRVE EL BUSCYL. Se necesitará el bonobús de AUVASA, el QR de la aplicación "Auvasa PAY", el pago en metálico al conductor o el pago con tarjeta bancaria a través del EMV.  
  
También se pueden sacar SOLO LOS DATOS DE AUVASA DESDE ESTE REPOSITORIO DE GITHUB: https://github.com/VallaBus/api-auvasa.git  
  
Pero ten en cuenta que debes dar créditos en el footer donde pone lo de actiosae, añadirías: "Datos de AUVASA obtenidos del repositorio api-auvasa de VallaBus (con hipervínculo al repositorio)".