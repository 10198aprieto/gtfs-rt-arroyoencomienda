import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/politica-privacidad")({
  component: PoliticaPrivacidad,
  head: () => ({
    meta: [
      { title: "Política de Privacidad — ArroyoBus" },
      { name: "description", content: "Política de privacidad y protección de datos de ArroyoBus conforme al RGPD y la LOPDGDD." },
      { property: "og:title", content: "Política de Privacidad — ArroyoBus" },
      { property: "og:description", content: "Información sobre el tratamiento de datos personales en ArroyoBus." },
    ],
  }),
});

function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Política de Privacidad</h1>
        </div>
        <p className="text-muted-foreground mb-12 text-lg">
          Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Responsable del tratamiento</h2>
            <p className="text-muted-foreground">
              El responsable del tratamiento de los datos personales que pudieran recogerse a
              través de este sitio web es <strong className="text-foreground">Mateo Fernández Prieto</strong>,
              titular del proyecto ArroyoBus. Puede contactar a través del formulario disponible
              en la página de <Link to="/contacto" className="text-primary underline">contacto</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Datos que se tratan</h2>
            <p className="text-muted-foreground mb-2">
              ArroyoBus es un servicio de consulta de transporte público. El uso ordinario del
              sitio <strong className="text-foreground">no requiere registro</strong> y no se
              recopilan datos personales identificativos por defecto. Únicamente se tratan:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                <strong className="text-foreground">Geolocalización del navegador</strong>,
                solo si el usuario la autoriza expresamente, para ordenar las paradas por
                cercanía. Esta información se procesa íntegramente en el dispositivo y no se
                envía a ningún servidor.
              </li>
              <li>
                <strong className="text-foreground">Datos técnicos de navegación</strong>
                (dirección IP, tipo de navegador, fecha y hora de acceso) en los registros
                técnicos del servidor, con la única finalidad de garantizar la seguridad y
                el correcto funcionamiento del servicio.
              </li>
              <li>
                <strong className="text-foreground">Datos del bot de Telegram</strong>
                (identificador de chat y comandos enviados), únicamente para usuarios que
                interactúan voluntariamente con <code className="bg-muted px-1 rounded">@arroyobus_bot</code>
                y necesarios para enviar las alertas solicitadas.
              </li>
              <li>
                <strong className="text-foreground">Datos del formulario de contacto</strong>
                (nombre, correo electrónico y mensaje), proporcionados voluntariamente por el
                usuario para responder a su consulta.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Base jurídica y finalidad</h2>
            <p className="text-muted-foreground">
              El tratamiento se basa en el <strong className="text-foreground">consentimiento del
              interesado</strong> (art. 6.1.a RGPD) para la geolocalización y el bot de Telegram, en
              la <strong className="text-foreground">ejecución de medidas precontractuales</strong>
              (art. 6.1.b RGPD) para las consultas recibidas, y en el <strong className="text-foreground">
              interés legítimo</strong> (art. 6.1.f RGPD) del responsable para garantizar la
              seguridad y el correcto funcionamiento del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Plazos de conservación</h2>
            <p className="text-muted-foreground">
              Los datos se conservarán durante el tiempo estrictamente necesario para la finalidad
              para la que fueron recabados y, en su caso, durante los plazos legalmente exigidos.
              Los registros técnicos del servidor se conservan, por regla general, un máximo de
              30 días. Los datos del bot de Telegram se eliminan al desuscribirse el usuario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Destinatarios y transferencias internacionales</h2>
            <p className="text-muted-foreground">
              No se cederán datos a terceros salvo obligación legal. La infraestructura del sitio
              se apoya en proveedores de servicios en la nube (Lovable Cloud / Supabase y
              Cloudflare) que pueden alojar datos en servidores ubicados en la Unión Europea o
              en países con un nivel adecuado de protección reconocido por la Comisión Europea,
              o bajo Cláusulas Contractuales Tipo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Derechos del interesado</h2>
            <p className="text-muted-foreground">
              El usuario puede ejercer en cualquier momento los derechos de <strong className="text-foreground">
              acceso, rectificación, supresión, limitación del tratamiento, oposición y
              portabilidad</strong>, así como retirar el consentimiento prestado, dirigiendo su
              solicitud a través del formulario de contacto, acreditando su identidad.
            </p>
            <p className="text-muted-foreground mt-2">
              Asimismo, tiene derecho a presentar una reclamación ante la <strong className="text-foreground">
              Agencia Española de Protección de Datos</strong> (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary underline">www.aepd.es</a>)
              si considera que el tratamiento de sus datos infringe la normativa aplicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Medidas de seguridad</h2>
            <p className="text-muted-foreground">
              Se aplican las medidas técnicas y organizativas adecuadas para garantizar un nivel
              de seguridad apropiado al riesgo, incluyendo el cifrado de las comunicaciones
              mediante HTTPS y controles de acceso a los sistemas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Menores de edad</h2>
            <p className="text-muted-foreground">
              El servicio puede ser utilizado por menores siempre que cuenten con la autorización
              de sus padres o tutores. No se recogen intencionadamente datos personales de
              menores de 14 años.
            </p>
          </section>
        </div>

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Mateo Fernández Prieto · Todos los derechos reservados
        </footer>
      </div>
    </div>
  );
}