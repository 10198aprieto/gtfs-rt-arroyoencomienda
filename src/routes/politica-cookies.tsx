import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Cookie } from "lucide-react";

export const Route = createFileRoute("/politica-cookies")({
  component: PoliticaCookies,
  head: () => ({
    meta: [
      { title: "Política de Cookies — ArroyoBus" },
      { name: "description", content: "Política de cookies de ArroyoBus conforme a la LSSI-CE y el RGPD." },
      { property: "og:title", content: "Política de Cookies — ArroyoBus" },
      { property: "og:description", content: "Información sobre el uso de cookies en ArroyoBus." },
    ],
  }),
});

function PoliticaCookies() {
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
          <Cookie className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Política de Cookies</h1>
        </div>
        <p className="text-muted-foreground mb-12 text-lg">
          Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. ¿Qué son las cookies?</h2>
            <p className="text-muted-foreground">
              Las cookies son pequeños archivos de texto que los sitios web almacenan en el
              navegador del usuario para recordar información sobre la visita, mejorar la
              experiencia de uso o analizar el comportamiento de navegación. Esta política
              se ajusta a lo dispuesto en el artículo 22.2 de la Ley 34/2002, de 11 de julio,
              de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)
              y al Reglamento (UE) 2016/679 (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Cookies utilizadas en ArroyoBus</h2>
            <p className="text-muted-foreground mb-3">
              ArroyoBus es un sitio minimalista que <strong className="text-foreground">no utiliza
              cookies publicitarias ni de seguimiento de terceros</strong>. Las únicas tecnologías
              de almacenamiento que se emplean son:
            </p>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold">Nombre</th>
                    <th className="text-left p-3 font-semibold">Tipo</th>
                    <th className="text-left p-3 font-semibold">Finalidad</th>
                    <th className="text-left p-3 font-semibold">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 font-mono">arroyobus_cookie_consent</td>
                    <td className="p-3">Técnica · 1ª parte</td>
                    <td className="p-3">Recordar la decisión del usuario sobre el aviso de cookies.</td>
                    <td className="p-3">12 meses</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">arroyobus_cards</td>
                    <td className="p-3">Técnica · 1ª parte (localStorage)</td>
                    <td className="p-3">Almacenar localmente las tarjetas Buscyl guardadas por el usuario.</td>
                    <td className="p-3">Hasta que el usuario las borre</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">Sesión de admin</td>
                    <td className="p-3">Técnica · 1ª parte</td>
                    <td className="p-3">Permitir el acceso al panel privado de administración.</td>
                    <td className="p-3">Sesión</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mt-3">
              Todas estas son <strong className="text-foreground">cookies técnicas o estrictamente
              necesarias</strong>, exentas del deber de consentimiento conforme al artículo 22.2 LSSI-CE
              y a las directrices de la AEPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Servicios de terceros</h2>
            <p className="text-muted-foreground">
              El mapa interactivo carga imágenes de mosaicos (tiles) desde los servidores de
              OpenStreetMap. OpenStreetMap puede registrar la dirección IP del visitante con
              fines técnicos. ArroyoBus no instala cookies de terceros con fines analíticos
              ni publicitarios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Gestión y revocación del consentimiento</h2>
            <p className="text-muted-foreground">
              El usuario puede aceptar, rechazar o revocar en cualquier momento su consentimiento
              borrando las cookies desde la configuración de su navegador o eliminando la entrada
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs mx-1">arroyobus_cookie_consent</code>
              de localStorage. Los principales navegadores ofrecen guías para gestionar cookies:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Google Chrome, Mozilla Firefox, Safari, Microsoft Edge, Opera y Brave.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Cambios en la política</h2>
            <p className="text-muted-foreground">
              ArroyoBus podrá modificar esta política para adaptarla a novedades legislativas
              o a nuevas funcionalidades del sitio. Se recomienda revisar esta página periódicamente.
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