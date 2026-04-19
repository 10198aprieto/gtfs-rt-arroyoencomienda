import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Scale } from "lucide-react";

export const Route = createFileRoute("/aviso-legal")({
  component: AvisoLegal,
  head: () => ({
    meta: [
      { title: "Aviso Legal y Términos de Uso — ArroyoBus GTFS-RT" },
      { name: "description", content: "Aviso legal y términos de uso del servicio ArroyoBus GTFS-RT. Información sobre el origen de los datos y la propiedad intelectual del código." },
      { property: "og:title", content: "Aviso Legal — ArroyoBus GTFS-RT" },
      { property: "og:description", content: "Términos de uso y aviso legal del servicio ArroyoBus GTFS-RT." },
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
            <h2 className="text-xl font-semibold mb-3">1. Origen de los datos</h2>
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
            <h2 className="text-xl font-semibold mb-3">2. Propiedad intelectual del código</h2>
            <p className="text-muted-foreground">
              El código fuente, diseño, implementación e infraestructura de este servicio son
              <strong className="text-foreground"> propiedad intelectual de Mateo Fernández Prieto</strong>,
              © {new Date().getFullYear()}. Todos los derechos reservados.
            </p>
            <p className="text-muted-foreground mt-2">
              Queda prohibida la reproducción, distribución, comunicación pública, transformación
              o cualquier otra forma de explotación del código, total o parcial, sin la autorización
              expresa y por escrito del titular. El uso no autorizado podrá ser perseguido conforme
              a la legislación vigente en materia de propiedad intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Uso permitido del feed</h2>
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
            <h2 className="text-xl font-semibold mb-3">4. Exención de responsabilidad</h2>
            <p className="text-muted-foreground">
              La información se ofrece <strong className="text-foreground">"tal cual" y "según disponibilidad"</strong>,
              sin garantías de exactitud, completitud, puntualidad o disponibilidad. El titular
              no se hace responsable de decisiones tomadas en base a estos datos ni de posibles
              errores, retrasos o interrupciones del servicio o de la API origen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Marcas y nombres comerciales</h2>
            <p className="text-muted-foreground">
              "ArroyoBus", "ActioSAE" y demás marcas mencionadas pertenecen a sus respectivos
              titulares y se citan con fines meramente informativos y descriptivos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Legislación aplicable</h2>
            <p className="text-muted-foreground">
              El presente aviso legal se rige por la legislación española. Para cualquier
              controversia derivada del uso del servicio, las partes se someten a los
              juzgados y tribunales competentes según la ley.
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
