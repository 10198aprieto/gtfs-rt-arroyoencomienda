import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, Mic, Sparkles, ArrowLeft, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/asistentes")({
  component: AsistentesPage,
  head: () => ({
    meta: [
      { title: "Asistentes de voz — ArroyoBus" },
      {
        name: "description",
        content:
          "Consulta los autobuses de Arroyo de la Encomienda desde WhatsApp, Siri (Atajos) y Amazon Alexa.",
      },
      { property: "og:title", content: "Asistentes de voz y mensajería — ArroyoBus" },
      {
        property: "og:description",
        content:
          "Configura WhatsApp, Siri (Atajos) y Amazon Alexa para preguntar por tus próximas llegadas de autobús en Arroyo de la Encomienda.",
      },
      { property: "og:url", content: "https://arroyobus.lovable.app/asistentes" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://arroyobus.lovable.app/asistentes" }],
  }),
});

const intent = (name: string, samples: string[], slots: { name: string; type: string }[] = []) => ({
  name,
  ...(slots.length ? { slots } : {}),
  samples,
});

const ALEXA_MODEL = JSON.stringify(
  {
    interactionModel: {
      languageModel: {
        invocationName: "arroyo bus",
        intents: [
          { name: "AMAZON.HelpIntent", samples: [] },
          { name: "AMAZON.StopIntent", samples: [] },
          { name: "AMAZON.CancelIntent", samples: [] },
          { name: "AMAZON.YesIntent", samples: [] },
          { name: "AMAZON.NoIntent", samples: [] },
          { name: "AMAZON.RepeatIntent", samples: [] },
          { name: "AMAZON.FallbackIntent", samples: [] },
          { name: "AMAZON.NavigateHomeIntent", samples: [] },
          intent("ParadaIntent", ["próximo bus en la parada {parada}", "cuándo llega el bus a {parada}", "parada {parada}", "qué buses pasan por {parada}", "consulta la parada {parada}"], [{ name: "parada", type: "AMAZON.SearchQuery" }]),
          intent("LineaParadaIntent", ["cuándo pasa la línea {linea} por {parada}", "cuándo llega la {linea} a {parada}", "próxima {linea} en {parada}", "cuándo pasa la {linea}"], [{ name: "linea", type: "LINEA" }, { name: "parada", type: "PARADA" }]),
          intent("DondeLineaIntent", ["dónde está la línea {linea}", "dónde va la {linea}", "por dónde va el {linea}"], [{ name: "linea", type: "LINEA" }]),
          intent("BusesActivosIntent", ["cuántos buses hay circulando", "cuántos autobuses hay", "hay buses ahora", "cuántos buses de la {linea} hay"], [{ name: "linea", type: "LINEA" }]),
          intent("AvisosIntent", ["hay avisos", "hay incidencias", "hay algún problema", "cómo va el servicio", "hay retrasos"]),
          intent("LineasIntent", ["qué líneas hay", "qué líneas tiene arroyo bus", "dime las líneas"]),
          intent("TarifasIntent", ["cuánto cuesta el billete", "precio del bus", "tarifas", "cuánto vale el autobús"]),
          intent("BuscylIntent", ["qué es la tarjeta buscyl", "cómo consigo la buscyl", "tarjeta buscyl", "abono"]),
          intent("ComoLlegarIntent", ["cómo voy a {destino}", "cómo llego a {destino}", "cómo ir a {destino}", "combinar con auvasa para ir a {destino}"], [{ name: "destino", type: "AMAZON.SearchQuery" }]),
          intent("BuhoIntent", ["horario del búho", "a qué hora pasa el búho", "bus nocturno"]),
          intent("TelefonoIntent", ["teléfono de atención", "a quién llamo", "número de teléfono"]),
          intent("PeticionIntent", ["la petición de change", "qué es la petición", "recogida de firmas"]),
          intent("RefrescarIntent", ["actualiza", "otra vez", "vuelve a consultar"]),
        ],
        types: [
          { name: "PARADA", values: [{"name": {"value": "Estación de Autobuses de Valladolid", "synonyms": ["1"]}}, {"name": {"value": "Paseo de Zorrilla 130 junto El Corte Inglés", "synonyms": ["2"]}}, {"name": {"value": "Avenida de Medina del Campo esquina Centro de Salud", "synonyms": ["3"]}}, {"name": {"value": "Avenida de Salamanca junto Cash IFA", "synonyms": ["4"]}}, {"name": {"value": "Calle Federación de Fútbol", "synonyms": ["5"]}}, {"name": {"value": "Avenida de Colón 175 frente pistas polideportivas", "synonyms": ["6"]}}, {"name": {"value": "Avenida de Colón 132", "synonyms": ["7"]}}, {"name": {"value": "Avenida de Colón frente Multiusos de la Vega", "synonyms": ["8"]}}, {"name": {"value": "Paseo de Juan Carlos I", "synonyms": ["9"]}}, {"name": {"value": "Avenida de José Luís Lasa 27", "synonyms": ["10"]}}, {"name": {"value": "Avenida de José Luis Lasa junto Glorieta de la Flecha", "synonyms": ["11"]}}, {"name": {"value": "Calle Presentación junto La Vaca", "synonyms": ["12"]}}, {"name": {"value": "Calle Ramón y Cajal frente edificio ADE", "synonyms": ["13"]}}, {"name": {"value": "Calle Ramón y Cajal Rotonda Alboroque", "synonyms": ["14"]}}, {"name": {"value": "Calle Juan de la Cierva", "synonyms": ["15"]}}, {"name": {"value": "Calle Juan de la Cierva frente Campos de Rugby", "synonyms": ["16"]}}, {"name": {"value": "Avenida de Valdezarce 1", "synonyms": ["17"]}}, {"name": {"value": "Calle Almazara 11", "synonyms": ["18"]}}, {"name": {"value": "Camino Viejo frente Campo de Golf", "synonyms": ["19"]}}, {"name": {"value": "Avenida Aguachales 15", "synonyms": ["20"]}}, {"name": {"value": "Calle Arnaldo Vilanova junto Centro Deportivo", "synonyms": ["21"]}}, {"name": {"value": "Calle Arnaldo Vilanova frente CEIP Kantica", "synonyms": ["22"]}}, {"name": {"value": "Calle Ramón y Cajal junto Rotonda de los Olivos", "synonyms": ["23"]}}, {"name": {"value": "Centro Comercial Rio Shopping", "synonyms": ["24"]}}, {"name": {"value": "Calle Ramón y Cajal frente Rotonda de los Olivos", "synonyms": ["25"]}}, {"name": {"value": "Avenida Aranzana 39", "synonyms": ["26"]}}, {"name": {"value": "Avenida Aranzana 29", "synonyms": ["27"]}}, {"name": {"value": "Avenida Aranzana frente IESO Arroyo", "synonyms": ["28"]}}, {"name": {"value": "Avenida Aranzana 9", "synonyms": ["29"]}}, {"name": {"value": "Calle Picones 15 junto Glorieta del Cañazo", "synonyms": ["30"]}}, {"name": {"value": "Plaza de España esquina Ayuntamiento", "synonyms": ["31"]}}, {"name": {"value": "Calle Almendrera frente CEIP Raimundo de Blas", "synonyms": ["32"]}}, {"name": {"value": "Calle Almendrera 16 Casa de Cultura", "synonyms": ["33"]}}, {"name": {"value": "Calle Camino de Zaratán 40A", "synonyms": ["34"]}}, {"name": {"value": "Calle Camino de Zaratán 22", "synonyms": ["35"]}}, {"name": {"value": "Calle Camino de Zaratán 2", "synonyms": ["36"]}}, {"name": {"value": "Avenida de Medina del Campo 15 frente Centro de Salud Arturo Eyries", "synonyms": ["37"]}}, {"name": {"value": "Paseo de Zorrilla 65 frente El Corte Inglés", "synonyms": ["38"]}}, {"name": {"value": "Paseo de Filipinos frente Campo Grande", "synonyms": ["39"]}}, {"name": {"value": "Calle Camino de Zaratán 2", "synonyms": ["40"]}}, {"name": {"value": "Calle Camino de Zaratán 22", "synonyms": ["41"]}}, {"name": {"value": "Calle Clavel 10", "synonyms": ["42"]}}, {"name": {"value": "Calle Clavel frente Casa de Cultura", "synonyms": ["43"]}}, {"name": {"value": "Calle Almendrera junto CEIP Raimundo de Blas", "synonyms": ["44"]}}, {"name": {"value": "Plaza de España frente Ayuntamiento", "synonyms": ["45"]}}, {"name": {"value": "Calle Picones 8 junto Farmacia", "synonyms": ["46"]}}, {"name": {"value": "Avenida Aranzana 9", "synonyms": ["47"]}}, {"name": {"value": "Avenida Aranzana junto IESO Arroyo", "synonyms": ["48"]}}, {"name": {"value": "Avenida Aranzana 29", "synonyms": ["49"]}}, {"name": {"value": "Avenida Aranzana 37", "synonyms": ["50"]}}, {"name": {"value": "Calle Arnaldo Vilanova frente Centro Deportivo", "synonyms": ["51"]}}, {"name": {"value": "Avenida de Valdezarce 1", "synonyms": ["52"]}}, {"name": {"value": "Calle Juan de la Cierva junto Campos de Rugby", "synonyms": ["53"]}}, {"name": {"value": "Cale Ramón y Cajal junto Rotonda Alboroque", "synonyms": ["54"]}}, {"name": {"value": "Calle Ramón y Cajal frente edificio ADE", "synonyms": ["55"]}}, {"name": {"value": "Avenida de José Luís Lasa junto Centro Deportivo La Vega", "synonyms": ["56"]}}, {"name": {"value": "Avenida de José Luís Lasa 16", "synonyms": ["57"]}}, {"name": {"value": "Paseo de Juan Carlos I", "synonyms": ["58"]}}, {"name": {"value": "Avenida de Colón 82 junto Multiusos de la Vega", "synonyms": ["59"]}}, {"name": {"value": "Avenida de Colón 132 esquina Calle Bartolomé de las Casas", "synonyms": ["60"]}}, {"name": {"value": "Avenida de Colón 175 junto pistas polideportivas", "synonyms": ["61"]}}, {"name": {"value": "Calle Federación de Fútbol", "synonyms": ["62"]}}, {"name": {"value": "Avenida de Salamanca junto Hipercor", "synonyms": ["63"]}}, {"name": {"value": "Plaza del Poniente", "synonyms": ["64"]}}, {"name": {"value": "Carretera de Segovia frente Universidad", "synonyms": ["65"]}}, {"name": {"value": "Plaza de Santa Cruz", "synonyms": ["66"]}}, {"name": {"value": "Paseo Prado de La Magdalena 18 Filosofía y Letras", "synonyms": ["67"]}}, {"name": {"value": "Calle Arnaldo Vilanova junto CEIP Kantica", "synonyms": ["68"]}}, {"name": {"value": "Avenida Aguachales 15 esquina Calle Estefanía", "synonyms": ["69"]}}, {"name": {"value": "Camino Viejo frente Campo de Golf", "synonyms": ["70"]}}, {"name": {"value": "Avenida Valdezarce esquina Calle Almazara", "synonyms": ["71"]}}, {"name": {"value": "Calle Juan de la Cierva esquina Calle Torres Quevedo", "synonyms": ["72"]}}, {"name": {"value": "Calle Arnaldo Vilanova junto CEIP Kantica", "synonyms": ["73"]}}, {"name": {"value": "Camino del Cementerio 35 junto Campus", "synonyms": ["74"]}}] },
          {
            name: "LINEA",
            values: [
              { name: { value: "azul", synonyms: ["línea azul"] } },
              { name: { value: "roja", synonyms: ["línea roja", "rojo"] } },
              { name: { value: "verde", synonyms: ["línea verde", "universidades"] } },
              { name: { value: "búho", synonyms: ["buho", "nocturno", "el búho"] } },
            ],
          },
        ],
      },
    },
  },
  null,
  2,
);

function CopyInline({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border border-border hover:bg-accent transition-all"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copiado" : label || "Copiar"}
    </button>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="text-[11px] bg-background border border-border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function AsistentesPage() {
  const [origin, setOrigin] = useState("https://gtfs-rt-arroyoencomienda.lovable.app");
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const whatsappUrl = `${origin}/api/public/whatsapp/webhook`;
  const alexaUrl = `${origin}/api/public/alexa/skill`;
  const voiceUrl = `${origin}/api/public/voice/stop?q=100`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="relative overflow-hidden border-b border-border"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="relative max-w-4xl mx-auto px-6 py-12 text-white">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Inicio
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" /> Nuevo
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
            Asistentes de voz y mensajería
          </h1>
          <p className="text-white/90 max-w-2xl">
            ArroyoBus en WhatsApp, Siri (Atajos) y Amazon Alexa. Pregunta por una
            parada y recibe las próximas llegadas al instante.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* WHATSAPP */}
        <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">WhatsApp</h2>
              <p className="text-sm text-muted-foreground">
                Webhook compatible con Twilio WhatsApp Business API.
              </p>
            </div>
          </div>
          <ol className="list-decimal pl-5 text-sm space-y-2 text-muted-foreground">
            <li>
              Crea una cuenta en <strong>Twilio</strong> y activa el Sandbox de
              WhatsApp (gratuito) o solicita un número WhatsApp Business.
            </li>
            <li>
              En la configuración del Sandbox / número, en{" "}
              <em>«When a message comes in»</em>, pega esta URL como webhook{" "}
              <strong>POST</strong>:
            </li>
          </ol>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[11px] bg-background border border-border rounded-md px-2 py-1.5 truncate">
              {whatsappUrl}
            </code>
            <CopyInline value={whatsappUrl} />
          </div>
          <p className="text-xs text-muted-foreground">
            Una vez configurado, envía por WhatsApp el número o nombre de una
            parada (p. ej. <code className="px-1 bg-background border border-border rounded">100</code>) y recibirás las próximas
            llegadas con la ubicación del bus.
          </p>
        </section>

        {/* SIRI */}
        <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Siri (Atajos de iOS)</h2>
              <p className="text-sm text-muted-foreground">
                Crea un atajo personal para preguntar a Siri.
              </p>
            </div>
          </div>
          <ol className="list-decimal pl-5 text-sm space-y-2 text-muted-foreground">
            <li>Abre la app <strong>Atajos</strong> en tu iPhone y crea un nuevo atajo.</li>
            <li>
              Añade la acción <strong>«Pedir entrada»</strong> con el texto{" "}
              <em>«¿Qué parada?»</em>.
            </li>
            <li>
              Añade <strong>«Obtener contenido de URL»</strong>:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Método: <code className="px-1 bg-background border border-border rounded">GET</code></li>
                <li>
                  URL:{" "}
                  <code className="px-1 bg-background border border-border rounded break-all">
                    {origin}/api/public/voice/stop?q=
                  </code>{" "}
                  + <em>Entrada proporcionada</em>
                </li>
              </ul>
            </li>
            <li>
              Añade <strong>«Obtener valor del diccionario»</strong> y elige la
              clave <code className="px-1 bg-background border border-border rounded">speech</code>.
            </li>
            <li>
              Termina con <strong>«Hablar texto»</strong>. Renombra el atajo a{" "}
              <em>«Próximo bus»</em> y di a Siri: <em>«Próximo bus»</em>.
            </li>
          </ol>
          <div className="flex items-center gap-2 pt-2">
            <code className="flex-1 text-[11px] bg-background border border-border rounded-md px-2 py-1.5 truncate">
              {voiceUrl}
            </code>
            <a
              href={voiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] px-2 py-1 rounded-md border border-border hover:bg-accent"
            >
              Probar
            </a>
            <CopyInline value={`${origin}/api/public/voice/stop?q=`} label="Base" />
          </div>
        </section>

        {/* ALEXA */}
        <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Amazon Alexa</h2>
              <p className="text-sm text-muted-foreground">
                Endpoint para una skill personalizada en la Alexa Developer Console.
              </p>
            </div>
          </div>
          <ol className="list-decimal pl-5 text-sm space-y-2 text-muted-foreground">
            <li>
              Entra en <strong>developer.amazon.com/alexa/console/ask</strong> y crea
              una skill <em>Custom</em> en español, con hosting <em>«Provision your own»</em>.
            </li>
            <li>
              En <strong>Endpoint</strong> → <em>HTTPS</em>, pega esta URL:
            </li>
          </ol>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[11px] bg-background border border-border rounded-md px-2 py-1.5 truncate">
              {alexaUrl}
            </code>
            <CopyInline value={alexaUrl} />
          </div>
          <ol className="list-decimal pl-5 text-sm space-y-2 text-muted-foreground" start={3}>
            <li>
              Selecciona el certificado <em>«My development endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority»</em>.
            </li>
            <li>
              En <strong>Interaction Model → JSON Editor</strong>, pega este modelo
              de intents:
            </li>
          </ol>
          <CodeBlock>{ALEXA_MODEL}</CodeBlock>
          <p className="text-xs text-muted-foreground">
            Si ya tenías la skill creada, sustituye el modelo antiguo por este, pulsa{" "}
            <strong>Save</strong> y <strong>Build Model</strong>. Prueba con{" "}
            <em>«Alexa, abre arroyo bus»</em>.
          </p>
          <div className="rounded-xl bg-background border border-border p-4 text-sm">
            <h3 className="font-semibold mb-2">Qué le puedes preguntar</h3>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-muted-foreground text-[13px]">
              <li>🚏 «próximo bus en la parada 100»</li>
              <li>🔵 «cuándo pasa la línea azul por Plaza España»</li>
              <li>📍 «dónde está la línea roja»</li>
              <li>🚌 «cuántos buses hay circulando»</li>
              <li>⚠️ «hay avisos» / «hay incidencias»</li>
              <li>🗺️ «qué líneas hay»</li>
              <li>🎫 «cuánto cuesta el billete»</li>
              <li>💳 «qué es la tarjeta BusCyL»</li>
              <li>🏥 «cómo voy al hospital Río Hortega»</li>
              <li>🎓 «cómo llego a la universidad»</li>
              <li>🦉 «horario del búho»</li>
              <li>📞 «teléfono de atención»</li>
              <li>✍️ «la petición de change»</li>
              <li>🔁 «repite» / «actualiza» (vuelve a consultar la última parada)</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              Alexa mantiene la conversación abierta: tras cada respuesta puedes
              hacer otra pregunta sin repetir «abre arroyo bus». Di «no» o «para» para terminar.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Opcional: para restringir el endpoint a tu skill, configura el secreto{" "}
            <code className="px-1 bg-background border border-border rounded">ALEXA_SKILL_ID</code>{" "}
            con el ID de tu skill (<code>amzn1.ask.skill...</code>).
          </p>
        </section>

        <section className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          <h3 className="text-base font-semibold text-foreground mb-2">¿Y Google Assistant?</h3>
          <p>
            Google retiró las <em>Conversational Actions</em> en 2023. Una skill de
            voz pública para Google Assistant ya no es posible sin una app Android
            nativa con App Actions. Como alternativa, en Android puedes crear un
            atajo del navegador que llame al mismo endpoint que Siri (
            <code className="px-1 bg-background border border-border rounded">/api/public/voice/stop?q=…</code>).
          </p>
        </section>
      </main>
    </div>
  );
}