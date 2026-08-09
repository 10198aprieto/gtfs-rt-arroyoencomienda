import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Scale } from "lucide-react";

export const Route = createFileRoute("/aviso-legal")({
  component: AvisoLegal,
  head: () => ({
    meta: [
      { title: "Aviso Legal y Condiciones Generales de Uso — ArroyoBus" },
      { name: "description", content: "Aviso legal y condiciones generales de uso de ArroyoBus: titularidad, origen de los datos, propiedad intelectual, enlaces y jurisdicción." },
      { property: "og:title", content: "Aviso Legal — ArroyoBus" },
      { property: "og:description", content: "Condiciones generales de uso y aviso legal del servicio ArroyoBus." },
    ],
  }),
});

function AvisoLegal() {
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
          <Scale className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Aviso Legal y Términos de Uso</h1>
        </div>
        <p className="text-muted-foreground mb-12 text-lg">
          Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Información general (LSSI-CE)</h2>
            <p className="text-muted-foreground">
              En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios
              de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se
              informa al usuario de los siguientes datos del titular del sitio web:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong className="text-foreground">Titular:</strong> Mateo Fernández Prieto (en adelante, "ArroyoBus - Autobuses en Tiempo Real").</li>
              <li><strong className="text-foreground">NIF:</strong> 71572693M.</li>
              <li><strong className="text-foreground">Actividad:</strong> proyecto personal sin ánimo de lucro de información sobre transporte público.</li>
              <li><strong className="text-foreground">Domicilio:</strong> C/ San Quince, nº 7, Chalet, 47195 — Arroyo de la Encomienda (Valladolid), España.</li>
              <li><strong className="text-foreground">Teléfono:</strong> <a href="tel:983182117" className="text-primary underline">983 182 117</a>.</li>
              <li><strong className="text-foreground">Email:</strong> <a href="mailto:arroyobusmaps@gmail.com" className="text-primary underline">arroyobusmaps@gmail.com</a>.</li>
              <li><strong className="text-foreground">Contacto adicional:</strong> formulario disponible en la página de <Link to="/contacto" className="text-primary underline">contacto</Link>.</li>
              <li><strong className="text-foreground">Dominios:</strong> arroyobus.lovable.app y www.arroyobus.net.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3"2. Objeto de las condiciones: el Sitio Web</h2>
            <p className="text-muted-foreground">
              El objeto de las presentes Condiciones Generales de Uso (en adelante, Condiciones) es
              regular el acceso y la utilización del Sitio Web. A estos efectos se entenderá como
              Sitio Web la apariencia externa de los interfaces de pantalla, tanto de forma estática
              como dinámica (el árbol de navegación), todos los elementos integrados en ellos
              (Contenidos) y todos aquellos servicios o recursos en línea que en su caso se ofrezcan
              a los Usuarios (Servicios).
            </p>
            <p className="text-muted-foreground mt-2">
              ArroyoBus se reserva la facultad de modificar, en cualquier momento y sin aviso previo,
              la presentación y configuración del Sitio Web y de los Contenidos y Servicios
              incorporados, así como de interrumpir, desactivar y/o cancelar cualquiera de ellos.
              El acceso al Sitio Web tiene carácter libre y gratuito, salvo el coste de la conexión
              a través de la red de telecomunicaciones del proveedor de acceso contratado por el
              Usuario. La utilización de determinados Contenidos o Servicios podrá requerir el
              registro o suscripción previa del Usuario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3"3. El Usuario</h2>
            <p className="text-muted-foreground">
              El acceso, la navegación y el uso del Sitio Web, así como de los espacios habilitados
              para interactuar (comentarios, formularios, canales de Telegram y WhatsApp, bot,
              asistente telefónico), confiere la condición de Usuario, aceptándose desde el inicio de
              la navegación todas las Condiciones aquí establecidas y sus ulteriores modificaciones.
              Se recomienda leerlas cada vez que se visite el Sitio Web.
            </p>
            <p className="text-muted-foreground mt-2">El Usuario asume su responsabilidad de hacer un uso correcto del Sitio Web, que se extenderá a:</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Un uso de la información, Contenidos, Servicios y datos que no sea contrario a estas Condiciones, la Ley, la moral o el orden público, ni lesione derechos de terceros o el propio funcionamiento del Sitio Web.</li>
              <li>La veracidad y licitud de las informaciones aportadas en los formularios. El Usuario notificará de forma inmediata cualquier hecho que permita el uso indebido de dicha información (robo, extravío o acceso no autorizado a identificadores y/o contraseñas) para proceder a su cancelación.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              ArroyoBus se reserva el derecho a retirar los comentarios y aportaciones que vulneren la
              ley, el respeto a la dignidad de la persona, o que sean discriminatorios, xenófobos,
              racistas, pornográficos, spam, o atenten contra la juventud, la infancia, el orden o la
              seguridad pública, sin ser responsable de las opiniones vertidas por los Usuarios. El
              mero acceso al Sitio Web no supone entablar relación comercial alguna.
            </p>
            <p className="text-muted-foreground mt-2">
              El Sitio Web se dirige a todas las personas y principalmente a Usuarios residentes en
              España. No se asegura el cumplimiento de legislaciones de otros países; quien acceda
              desde otro lugar lo hará bajo su propia responsabilidad y deberá asegurarse de cumplir
              la legislación local aplicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3"4. Origen de los datos</h2>
            <p className="text-muted-foreground">
              Los datos de posiciones de vehículos, estimaciones de llegada y horarios mostrados
              en este servicio se obtienen de la <strong className="text-foreground">API pública de ActioSAE</strong>,
              proveedor del sistema de información del servicio de autobuses urbanos de
              Arroyo de la Encomienda (Valladolid, España). Los datos GTFS estáticos provienen
              de la misma fuente.
            </p>
            <p className="text-muted-foreground mt-2">
              Este sitio <strong className="text-foreground">no está afiliado, asociado, ni respaldado oficialmente</strong> por
              ActioSAE, el Ayuntamiento de Arroyo de la Encomienda, ni por la empresa operadora
              del servicio de transporte. Es un proyecto independiente que reformatea datos
              públicos al estándar GTFS Realtime.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3"5. Propiedad intelectual e industrial</h2>
            <p className="text-muted-foreground">
              El código fuente, diseño, implementación e infraestructura de este servicio son
              <strong className="text-foreground"> propiedad intelectual de Mateo Fernández Prieto</strong>,
              © {new Date().getFullYear()}. Todos los derechos reservados.
            </p>
            <p className="text-muted-foreground mt-2">
              Queda prohibida la reproducción, distribución, comunicación pública, transformación
              o cualquier otra forma de explotación del código, total o parcial, sin la autorización
              expresa y por escrito del titular. El uso no autorizado podrá ser perseguido conforme
              al Real Decreto Legislativo 1/1996, de 12 de abril, por el que se aprueba el texto
              refundido de la Ley de Propiedad Intelectual, y a la Ley 17/2001, de 7 de diciembre,
              de Marcas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3"6. Condiciones de uso del sitio</h2>
            <p className="text-muted-foreground">
              El acceso al sitio es libre y gratuito. El usuario se compromete a hacer un uso
              diligente del mismo, conforme a la ley, al presente aviso legal, a la moral y al
              orden público. En particular, queda prohibido:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Realizar actividades ilícitas, lesivas de derechos o que puedan dañar a terceros.</li>
              <li>Introducir o difundir virus informáticos o cualesquiera otros sistemas que puedan provocar daños en el sitio o en los sistemas de terceros.</li>
              <li>Suplantar la identidad de otro usuario o realizar accesos no autorizados.</li>
              <li>Realizar peticiones automatizadas masivas que puedan afectar al rendimiento del servicio o de la API origen.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3"7. Uso permitido del feed GTFS Realtime</h2>
            <p className="text-muted-foreground">
              Los endpoints GTFS Realtime (<code className="bg-muted px-1.5 py-0.5 rounded text-xs">/api/gtfs-rt/*</code>)
              y el archivo GTFS estático se ofrecen de forma gratuita para su consumo en
              aplicaciones de información al viajero (Google Maps, Transit, OpenTripPlanner, etc.).
            </p>
            <p className="text-muted-foreground mt-2">
              Se ruega un uso razonable del servicio, evitando peticiones excesivas que puedan
              sobrecargar la infraestructura o la API origen. El servicio puede ser interrumpido,
              modificado o retirado sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3"8. Exención y limitación de responsabilidad</h2>
            <p className="text-muted-foreground">
              La información se ofrece <strong className="text-foreground">"tal cual" y "según disponibilidad"</strong>,
              sin garantías de exactitud, completitud, puntualidad o disponibilidad. El titular
              no se hace responsable de decisiones tomadas en base a estos datos ni de posibles
              errores, retrasos o interrupciones del servicio o de la API origen.
            </p>
            <p className="text-muted-foreground mt-2">
              El titular no asume ninguna responsabilidad derivada de la conexión o contenidos
              de los enlaces de terceros a los que se haga referencia en el sitio (por ejemplo,
              OpenStreetMap, ayuda alojada en GitBook o el canal de Telegram), siendo el
              responsable de los mismos la persona o entidad que los preste.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3"9. Protección de datos personales</h2>
            <p className="text-muted-foreground">
              El tratamiento de los datos personales que pudieran recabarse a través del sitio
              se rige por lo dispuesto en la <Link to="/politica-privacidad" className="text-primary underline">Política
              de Privacidad</Link>, en cumplimiento del Reglamento (UE) 2016/679 (RGPD) y de la
              Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y
              garantía de los derechos digitales (LOPDGDD).
            </p>
            <p className="text-muted-foreground mt-2">
              La información sobre el uso de cookies se detalla en la{" "}
              <Link to="/politica-cookies" className="text-primary underline">Política de Cookies</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3"10. Marcas y nombres comerciales</h2>
            <p className="text-muted-foreground">
              "ArroyoBus", "ActioSAE" y demás marcas mencionadas pertenecen a sus respectivos
              titulares y se citan con fines meramente informativos y descriptivos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3"11. Legislación aplicable y jurisdicción</h2>
            <p className="text-muted-foreground">
              El presente aviso legal se rige por la legislación española. Para cualquier
              controversia derivada del uso del servicio, y salvo que la normativa aplicable
              en materia de consumidores disponga otra cosa, las partes se someten, con
              renuncia expresa a cualquier otro fuero, a los Juzgados y Tribunales de
              Valladolid (España).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3"12. Modificación del aviso legal</h2>
            <p className="text-muted-foreground">
              El titular se reserva el derecho a modificar el presente aviso legal en cualquier
              momento para adaptarlo a novedades legislativas, jurisprudenciales o a las
              prácticas habituales del sector. Las modificaciones surtirán efecto desde su
              publicación en el sitio.
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
