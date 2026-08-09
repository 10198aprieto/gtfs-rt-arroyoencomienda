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
              ArroyoBus <strong className="text-foreground">no utiliza cookies publicitarias</strong>.
              Se emplean cookies y almacenamiento local estrictamente necesarios para el
              funcionamiento del sitio y, si el usuario lo autoriza, una cookie analítica de
              Google Analytics con IP anonimizada. Detalle:
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
                  <tr>
                    <td className="p-3 font-mono">_ga, _ga_QB86L2QP32</td>
                    <td className="p-3">Analítica · 3ª parte (Google Analytics 4)</td>
                    <td className="p-3">Medir de forma agregada el uso del sitio (páginas vistas, sesiones). Solo se carga si el usuario acepta el banner. IP anonimizada.</td>
                    <td className="p-3">Hasta 24 meses</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mt-3">
              Las tres primeras son <strong className="text-foreground">cookies técnicas o estrictamente
              necesarias</strong>, exentas del deber de consentimiento conforme al artículo 22.2 LSSI-CE
              y a las directrices de la AEPD. Las cookies de Google Analytics son de finalidad
              analítica y requieren consentimiento previo, que se solicita mediante el banner de cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Servicios de terceros</h2>
            <p className="text-muted-foreground">
              El mapa interactivo carga imágenes de mosaicos (tiles) desde los servidores de
              OpenStreetMap, que puede registrar la dirección IP del visitante con fines técnicos.
              Si el usuario acepta las cookies analíticas, se carga <strong className="text-foreground">Google
              Analytics 4</strong> (Google Ireland Limited) con IP anonimizada y sin señales de
              publicidad. Puede haber transferencias internacionales de datos amparadas por las
              cláusulas contractuales tipo de la Comisión Europea. ArroyoBus no instala cookies
              publicitarias ni de terceros con fines de perfilado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Gestión y revocación del consentimiento</h2>
            <p className="text-muted-foreground">
              El usuario puede aceptar o rechazar las cookies analíticas al entrar en el sitio y
              revocar en cualquier momento su decisión con el botón de abajo o borrándolas desde
              la configuración del navegador. Al revocar, se detendrá la carga de Google Analytics
              en las siguientes navegaciones.
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem("arroyobus_cookie_consent");
                  window.dispatchEvent(new CustomEvent("arroyobus:consent-changed"));
                } catch {}
                window.location.reload();
              }}
              className="mt-3 px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-accent transition-colors"
            >
              Revocar consentimiento y volver a mostrar el banner
            </button>
            <p className="text-muted-foreground mt-3">
              Los principales navegadores ofrecen guías para gestionar cookies:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Google Chrome, Mozilla Firefox, Safari, Microsoft Edge, Opera y Brave.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cambios en la política</h2>
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