# 🚏 No aparece ningún bus activo

Si al abrir el mapa no ves ningún autobús en circulación, puede deberse a que el servicio no está operando en ese momento, o a un problema temporal con los datos en tiempo real. Sigue estos pasos para comprobarlo.

***

## 1. Verifica que hay buses en circulación

Puedes consultar directamente la API para confirmar si hay vehículos activos en este momento:

1. Abre esta dirección en tu navegador:\
   👉 [arroyobus-api.lovable.app/explorer](https://arroyobus-api.lovable.app/explorer)
2. Verás un explorador de la API con un menú desplegable. Despliégalo y selecciona la opción:\
   &#xNAN;**`GET /vehiclePositions`**
3. Pulsa el botón **Ejecutar** (o **Try it out**).
4. Observa la respuesta:
   * Si aparece una lista de vehículos con coordenadas → la API tiene datos y el mapa debería mostrarlos.
   * Si la lista aparece **vacía** (`"entity": []`) → no hay buses activos en este momento según la fuente de datos.

***

## 2. Causas más habituales

| Situación                         | Explicación                                                                 |
| --------------------------------- | --------------------------------------------------------------------------- |
| 🕐 Fuera del horario de servicio  | Los autobuses no circulan de noche ni en ciertos festivos                   |
| 📡 Retardo en la API de origen    | ActioSAE puede tardar unos segundos en actualizar; espera 15–30 s y recarga |
| 🌐 Problema temporal del servidor | El servicio puede estar en mantenimiento puntual                            |
| 📵 Sin conexión a internet        | Comprueba tu conexión antes de descartar otras causas                       |

***

## 3. ¿Sigue sin funcionar?

Si la API devuelve datos pero el mapa sigue vacío, o si detectas un comportamiento anómalo, escríbenos:

📧 [mfernandezprieto@icloud.com](mailto:mfernandezprieto@icloud.com)\
🌐 [arroyobus.lovable.app/contacto](https://arroyobus.lovable.app/contacto)

Incluye si es posible una captura de la respuesta del Explorer para que podamos diagnosticarlo más rápido.
