import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";

export const Route = createFileRoute("/contacto")({
  component: Contacto,
  head: () => ({
    meta: [
      { title: "Contacto — ArroyoBus GTFS-RT" },
      { name: "description", content: "Contacta con el responsable del servicio ArroyoBus GTFS-RT para sugerencias, incidencias o consultas." },
      { property: "og:title", content: "Contacto — ArroyoBus GTFS-RT" },
      { property: "og:description", content: "Contacta con el responsable del servicio ArroyoBus GTFS-RT." },
    ],
  }),
});

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdk3VFXqiX_y4lMK9X6Qoc3EeviVsCKN9nYX9_ZyEroXEB2-A/viewform?embedded=true";
const FORM_PUBLIC_URL = "https://forms.gle/M7ftCrP7AGLdSikZ7";

function Contacto() {
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
          <Mail className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Contacto</h1>
        </div>
        <p className="text-muted-foreground mb-8 text-lg">
          ¿Sugerencias, incidencias o quieres reportar un problema con el feed? Rellena el siguiente formulario.
        </p>

        <div className="rounded-xl overflow-hidden border border-border bg-card">
          <iframe
            src={FORM_URL}
            title="Formulario de contacto ArroyoBus"
            className="w-full"
            style={{ height: "1400px", border: 0 }}
            loading="lazy"
          >
            Cargando…
          </iframe>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          ¿No ves el formulario?{" "}
          <a href={FORM_PUBLIC_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Ábrelo en una pestaña nueva
          </a>
          .
        </p>

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Mateo Fernández Prieto · Todos los derechos reservados
        </footer>
      </div>
    </div>
  );
}
