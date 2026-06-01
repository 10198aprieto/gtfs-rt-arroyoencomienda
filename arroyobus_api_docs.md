# ArroyoBus — ActioSAE BFF API

Documentación interna sobre la API privada del SAE de ActioSAE que alimenta el
feed GTFS-RT de ArroyoBus. Sustituye a la nota previa que asumía un endpoint
sin clave: el backend exige ahora autenticación tipo Google API Key con
restricción por *package name* + *SHA-1 del certificado* (las "restricciones
Android" del proyecto Google Cloud que tiene contratado ActioSAE).

## Endpoints

| Método | Ruta                                              | Descripción                              |
|--------|---------------------------------------------------|------------------------------------------|
| GET    | `/bff/mobile/route/list`                          | Lista de líneas                          |
| GET    | `/bff/mobile/stop/list`                           | Lista de paradas (con lat/lon)           |
| GET    | `/bff/mobile/stopInfo/{stop_id}`                  | Info de una parada                       |
| GET    | `/bff/mobile/arrivals/{stopId}`                   | Próximas llegadas                        |
| GET    | `/bff/mobile/vehiclePosition`                     | Posición GPS de vehículos (realtime)     |
| GET    | `/bff/mobile/alert/list`                          | Alertas                                  |
| POST   | `/bff/mobile/transportation-request/send`         | Enviar petición TAD                      |
| POST   | `/bff/mobile/v1.1/send-suggestion`                | Enviar sugerencias                       |

Base URL: `https://arroyo.actiosae.com/`

## Autenticación

- **API key (query param):** `key=AIzaSyCvtaF21g0lPX0cTgOiIcHZNZRQlw2TRVA`
- **Feed id (query param):** `feedId=arroyo`
- **Headers obligatorios** (restricción Android de Google Cloud):

```
X-Android-Package: com.geoactio.arroyo_encomienda
X-Android-Cert:    222E5B204DE7B52F04DBED2A8B7947D566B0C2CA
```

Sin esos headers la API responde `403 Client application blocked` (la API key
por sí sola no basta, ya que está restringida a la app oficial).

## Ejemplo

```bash
curl -H "X-Android-Package: com.geoactio.arroyo_encomienda" \
     -H "X-Android-Cert: 222E5B204DE7B52F04DBED2A8B7947D566B0C2CA" \
     "https://arroyo.actiosae.com/bff/mobile/vehiclePosition?feedId=arroyo&key=AIzaSyCvtaF21g0lPX0cTgOiIcHZNZRQlw2TRVA"
```

## Notas

- **No es GTFS-Realtime estándar (protobuf).** Es una API JSON propietaria del
  SAE de Actio (mismo backend en otras ciudades, cambia solo el `feedId`). El
  servicio `arroyobus.lovable.app` mapea estas respuestas a `FeedMessage` para
  exponer un GTFS-RT canónico en `/api/gtfs-rt/*`.
- La key del Maps/Places de la app es `AIzaSyDALrUgeau2CHzVMv0NVcQiv8k9hsjGvoc`
  (también restringida, no se usa en este backend).
- Su uso fuera de la app oficial puede infringir los términos de servicio del
  Ayuntamiento de Arroyo / Actio. Uso bajo responsabilidad del operador.

## Configuración en el proyecto

- La clave puede sobreescribirse con la variable de entorno
  `ACTIOSAE_API_KEY`. Si no está definida, `src/lib/gtfsrt/fetch-arrivals.ts`
  cae al valor por defecto documentado arriba.
- Los headers `X-Android-Package` / `X-Android-Cert` están codificados como
  constantes en `fetch-arrivals.ts` porque forman parte de la "llave" pública
  extraída del APK.