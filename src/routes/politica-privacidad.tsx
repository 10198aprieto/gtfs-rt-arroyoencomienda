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
              titular del proyecto ArroyoBus - Autobuses en Tiempo Real. Datos de contacto:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong className="text-foreground">NIF:</strong> 71572693-M.</li>
              <li><strong className="text-foreground">Dirección:</strong> C/ San Quince, nº 7, Chalet, 47195 — Arroyo de la Encomienda (Valladolid).</li>
              <li><strong className="text-foreground">Teléfono:</strong> <a href="tel:983182117" className="text-primary underline">983 182 117</a>.</li>
              <li><strong className="text-foreground">Email:</strong> <a href="mailto:arroyobusmaps@gmail.com" className="text-primary underline">arroyobusmaps@gmail.com</a>.</li>
              <li><strong className="text-foreground">Sitios web:</strong> arroyobus.lovable.app y www.arroyobus.net.</li>
              <li><strong className="text-foreground">Contacto adicional:</strong> formulario de <Link to="/contacto" className="text-primary underline">contacto</Link>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Normativa aplicable</h2>
            <p className="text-muted-foreground mb-2">
              Esta política está adaptada a la normativa española y europea vigente en materia de
              protección de datos personales en internet. En concreto, respeta:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Reglamento (UE) 2016/679, de 27 de abril de 2016 (RGPD).</li>
              <li>Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPD-GDD).</li>
              <li>Real Decreto 1720/2007, de 21 de diciembre (RDLOPD).</li>
              <li>Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              En cumplimiento del RGPD y la LOPD-GDD, los datos recabados mediante los formularios
              del sitio quedarán incorporados y serán tratados con el fin de facilitar, agilizar y
              cumplir los compromisos establecidos con el Usuario, o para atender su solicitud o
              consulta. Salvo que resulte de aplicación la excepción del artículo 30.5 del RGPD, se
              mantiene un registro de actividades de tratamiento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Principios aplicables al tratamiento</h2>
            <p className="text-muted-foreground mb-2">
              El tratamiento de los datos personales del Usuario se somete a los principios del
              artículo 5 del RGPD y del artículo 4 y siguientes de la LOPD-GDD:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong className="text-foreground">Licitud, lealtad y transparencia:</strong> se requerirá el consentimiento previa información transparente de los fines.</li>
              <li><strong className="text-foreground">Limitación de la finalidad:</strong> fines determinados, explícitos y legítimos.</li>
              <li><strong className="text-foreground">Minimización de datos:</strong> únicamente los estrictamente necesarios.</li>
              <li><strong className="text-foreground">Exactitud:</strong> datos exactos y actualizados.</li>
              <li><strong className="text-foreground">Limitación del plazo de conservación:</strong> solo durante el tiempo necesario.</li>
              <li><strong className="text-foreground">Integridad y confidencialidad:</strong> garantizando su seguridad.</li>
              <li><strong className="text-foreground">Responsabilidad proactiva:</strong> el Responsable asegura el cumplimiento de los anteriores.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Las categorías de datos tratadas son únicamente <strong className="text-foreground">datos
              identificativos</strong>. En ningún caso se tratan categorías especiales de datos
              personales en el sentido del artículo 9 del RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Datos que se tratan</h2>
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
            <h2 className="text-xl font-semibold mb-3">5. Base jurídica y finalidad</h2>
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
            <h2 className="text-xl font-semibold mb-3">6. Plazos de conservación</h2>
            <p className="text-muted-foreground">
              Los datos se conservarán durante el tiempo estrictamente necesario para la finalidad
              para la que fueron recabados y, en su caso, durante los plazos legalmente exigidos.
              Los registros técnicos del servidor se conservan, por regla general, un máximo de
              30 días. Los datos del bot de Telegram se eliminan al desuscribirse el usuario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Destinatarios y transferencias internacionales</h2>
            <p className="text-muted-foreground">
              No se cederán datos a terceros salvo obligación legal. La infraestructura del sitio
              se apoya en proveedores de servicios en la nube (Lovable Cloud / Supabase y
              Cloudflare) que pueden alojar datos en servidores ubicados en la Unión Europea o
              en países con un nivel adecuado de protección reconocido por la Comisión Europea,
              o bajo Cláusulas Contractuales Tipo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Derechos del interesado</h2>
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
            <h2 className="text-xl font-semibold mb-3">9. Medidas de seguridad</h2>
            <p className="text-muted-foreground">
              Se aplican las medidas técnicas y organizativas adecuadas para garantizar un nivel
              de seguridad apropiado al riesgo, incluyendo el cifrado de las comunicaciones
              mediante HTTPS y controles de acceso a los sistemas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Menores de edad</h2>
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