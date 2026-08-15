# 🚌 ArroyoBus

**Autobuses de Arroyo de la Encomienda en tiempo real.**

ArroyoBus es una plataforma de seguimiento en tiempo real para la Red de Transporte Urbano y Metropolitano de Arroyo de la Encomienda (Valladolid). Ofrece mapa en vivo, próximas llegadas por parada, avisos del servicio y un feed **GTFS-Realtime** abierto, generado a partir de la API pública de ActioSAE.

🔗 **Web:** [arroyobus.net](https://arroyobus.net) · [arroyobus.lovable.app](https://arroyobus.lovable.app)
🤖 **Bot de Telegram:** [@arroyobus_bot](https://t.me/arroyobus_bot)
📢 **Canal de Telegram:** [t.me/arroyobus](https://t.me/arroyobus)
💬 **Canal de WhatsApp:** [Seguir canal](https://whatsapp.com/channel/0029Vb8UC0KCBtx7VxjSsq2m)
📞 **Asistente telefónico:** 941 683 091
📖 **Centro de ayuda:** [arroyobus.gitbook.io/ayuda](https://arroyobus.gitbook.io/ayuda/)

---

## ✨ Funcionalidades

- **Mapa en vivo** con posición GPS de los autobuses activos, actualizado cada 15 s.
- **Tiempos de llegada** en tiempo real por parada y línea (Roja, Azul, Verde y Búho).
- **Buscador de paradas** y detalle de rutas.
- **Avisos del servicio** e incidencias en tiempo real.
- **Bot de Telegram** para consultar paradas, configurar alertas y avisos de llegada (`/parada`, `/buscar`, `/alertar`, `/recordar`).
- **Canal de WhatsApp** con los mismos avisos, sin necesidad de instalar nada.
- **Asistente telefónico gratuito** para posición del bus, tiempos de llegada, horarios, incidencias y gestión de la tarjeta BusCyL.
- **Gestión de la tarjeta BusCyL** (Abono Transporte Metropolitano).
- **API GTFS-Realtime** abierta, compatible con Google Maps, Transit App, OpenTripPlanner y cualquier cliente GTFS-RT.
- **GTFS estático** descargable (paradas, rutas, horarios y calendario).

---

## 🛰️ API GTFS-Realtime

Feed abierto y gratuito, disponible en formato Protobuf estándar y JSON de depuración.

| Feed | Protobuf | JSON |
|---|---|---|
| Trip Updates | `/api/gtfs-rt/trip-updates` | `/api/gtfs-rt/trip-updates?format=json` |
| Vehicle Positions | `/api/gtfs-rt/vehicle-positions` | `/api/gtfs-rt/vehicle-positions?format=json` |

### GTFS estático

Paradas, rutas, horarios y calendario en formato GTFS estándar:

```
https://www.arroyobus.net/GTFS_Static.zip
```

> Los datos se obtienen a partir de la API pública de ActioSAE, el sistema de ayuda a la explotación (SAE) que da servicio a la flota de Arroyo de la Encomienda.

---

## 🏗️ Stack

- Sitio web construido con **Lovable** (React + Vite + TailwindCSS).
- Generación y publicación de los feeds **GTFS-RT** (Vehicle Positions, Trip Updates, Service Alerts) mediante funciones serverless (Supabase Edge Functions).
- Bot de Telegram y canal de WhatsApp para notificaciones y consultas ciudadanas.
- Documentación de usuario servida con **GitBook**.

---

## 🚀 Desarrollo local

```bash
git clone https://github.com/10198aprieto/gtfs-rt-arroyoencomienda.git
cd gtfs-rt-arroyoencomienda
npm install
npm run dev
```

---

## 📄 Legal

- [Aviso legal](https://www.arroyobus.net/aviso-legal)
- [Política de privacidad](https://www.arroyobus.net/politica-privacidad)
- [Política de cookies](https://www.arroyobus.net/politica-cookies)

---

## 👤 Autor

Desarrollado y mantenido por **Mateo Fernández Prieto**.

📩 [Contacto](https://www.arroyobus.net/contacto)

© 2026 Mateo Fernández Prieto · Todos los derechos reservados
