# 🚌 Guía de inicio — ArroyoBus

> Sigue los autobuses de **Arroyo de la Encomienda** en tiempo real. Llegadas, posiciones GPS y un feed GTFS-RT abierto para toda la comunidad.

***

## ¿Qué es ArroyoBus?

ArroyoBus es una plataforma gratuita y de código abierto que permite consultar en tiempo real el estado de los autobuses de **Arroyo de la Encomienda (Valladolid)**. Ofrece posiciones GPS, estimaciones de llegada a parada y una API GTFS-RT compatible con las principales apps de transporte.

Los datos provienen de la **API pública de ActioSAE** y se actualizan cada 15 segundos.

***

## Acceso rápido

| Canal             | Enlace                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| 🌐 Web principal  | [arroyobus.net](https://arroyobus.net) ([arroyobus.lovable.app](https://arroyobus.lovable.app/)) |
| 📱 App            | [arroyobus.lovable.app/app](https://arroyobus.lovable.app/app)                                   |
| ✈️ Canal Telegram | [@arroyobus](https://t.me/arroyobus)                                                             |
| 📡 API GTFS-RT    | [Ver documentación](guia-de-inicio-arroyobus.md#api-gtfs-realtime)                               |

***

## Primeros pasos

{% stepper %}
{% step %}
### Consultar el mapa en vivo

Visita la **página principal** y desplázate hasta la sección **Mapa en vivo**. Verás la posición en tiempo real de los autobuses en circulación. El mapa se refresca automáticamente cada 15 segundos.
{% endstep %}

{% step %}
### Usar el bot de Telegram

Únete al canal `@arroyobus` en Telegram y usa los siguientes comandos:

| Comando               | Descripción                                             |
| --------------------- | ------------------------------------------------------- |
| `/parada 100`         | Consulta las próximas llegadas a la parada 100          |
| `/buscar Camino`      | Busca paradas cuyo nombre contenga "Camino"             |
| `/alertar 100 5`      | Avisa cuando un bus esté a 5 minutos de la parada 100   |
| `/recordar 100 08:30` | Programa un aviso diario a las 08:30 para la parada 100 |
| `/ayuda`              | Obtienes esta misma lista                               |
{% endstep %}
{% endstepper %}

***

## API GTFS-Realtime

La API es **abierta y gratuita**. Es compatible con Google Maps, Transit App, OpenTripPlanner y cualquier cliente GTFS-RT estándar.

### Trip Updates

Estimaciones de llegada en tiempo real para cada parada y viaje activo.

```
GET /api/gtfs-rt/trip-updates           → Protobuf
GET /api/gtfs-rt/trip-updates?format=json → JSON
```

### Vehicle Positions

Posiciones GPS en tiempo real de los autobuses activos.

```
GET /api/gtfs-rt/vehicle-positions           → Protobuf
GET /api/gtfs-rt/vehicle-positions?format=json → JSON
```

***

## GTFS Estático

Descarga el paquete completo con paradas, rutas, horarios y calendario en formato GTFS estándar:

➡️ [Descargar GTFS\_Static.zip](https://arroyobus.lovable.app/GTFS_Static.zip)

***

## Preguntas frecuentes

<details>

<summary>¿Con qué frecuencia se actualiza la información?</summary>

El mapa en vivo y la API se actualizan cada 15 segundos a partir de los datos de ActioSAE.

</details>

<details>

<summary>¿Es necesario registrarse para usar la API?</summary>

No. La API GTFS-RT es completamente abierta y no requiere clave de acceso. (por ahora)

</details>

<details>

<summary>¿Está disponible para otras ciudades?</summary>

Por ahora la plataforma cubre exclusivamente los autobuses de Arroyo de la Encomienda.

</details>

<details>

<summary>¿Cómo reporto un error o hago una sugerencia?</summary>

Puedes contactar a través de [arroyobus.lovable.app/contacto](https://arroyobus.lovable.app/contacto).

</details>

***

## Aviso legal

© 2026 Mateo Fernández Prieto · Todos los derechos reservados.\
Consulta el [aviso legal completo](https://arroyobus.lovable.app/aviso-legal) en la web.
