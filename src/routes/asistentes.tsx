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
    ],
  }),
});

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
          <CodeBlock>{`{
  "interactionModel": {
    "languageModel": {
      "invocationName": "arroyo bus",
      "intents": [
        { "name": "AMAZON.HelpIntent", "samples": [] },
        { "name": "AMAZON.StopIntent", "samples": [] },
        { "name": "AMAZON.CancelIntent", "samples": [] },
        {
          "name": "ParadaIntent",
          "slots": [{ "name": "parada", "type": "AMAZON.SearchQuery" }],
          "samples": [
            "próximo bus en la parada {parada}",
            "cuándo llega el bus a {parada}",
            "parada {parada}",
            "qué buses pasan por {parada}",
            "{parada}"
          ]
        }
      ]
    }
  }
}`}</CodeBlock>
          <p className="text-xs text-muted-foreground">
            Guarda, construye el modelo y prueba con{" "}
            <em>«Alexa, abre arroyo bus»</em> →{" "}
            <em>«próximo bus en la parada 100»</em>.
          </p>
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