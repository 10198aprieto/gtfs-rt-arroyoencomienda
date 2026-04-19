import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

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

const RECIPIENTS = ["mfernandezprieto@icloud.com", "a.prieto@maristasccv.es"];

const contactSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  email: z.string().trim().email("Email no válido").max(255, "Máximo 255 caracteres"),
  subject: z.string().trim().min(1, "El asunto es obligatorio").max(150, "Máximo 150 caracteres"),
  message: z.string().trim().min(10, "El mensaje debe tener al menos 10 caracteres").max(2000, "Máximo 2000 caracteres"),
});

function Contacto() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    const { name, email, subject, message } = result.data;
    const body = `Nombre: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto = `mailto:${RECIPIENTS.join(",")}?subject=${encodeURIComponent(`[ArroyoBus] ${subject}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
  };

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-16">
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
        <p className="text-muted-foreground mb-10 text-lg">
          ¿Sugerencias, incidencias o quieres reportar un problema con el feed? Rellena el formulario y se abrirá tu cliente de correo con el mensaje listo para enviar.
        </p>

        {sent && (
          <div className="mb-6 p-4 border border-primary/30 bg-primary/5 rounded-lg text-sm">
            Se ha abierto tu cliente de correo. Si no se ha abierto automáticamente, puedes escribirme directamente a{" "}
            {RECIPIENTS.map((r, i) => (
              <span key={r}>
                <a href={`mailto:${r}`} className="text-primary underline">{r}</a>
                {i < RECIPIENTS.length - 1 && " o "}
              </span>
            ))}.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">Nombre</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={update("name")}
              maxLength={100}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">Tu email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={update("email")}
              maxLength={255}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1.5">Asunto</label>
            <input
              id="subject"
              type="text"
              value={form.subject}
              onChange={update("subject")}
              maxLength={150}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1.5">Mensaje</label>
            <textarea
              id="message"
              value={form.message}
              onChange={update("message")}
              rows={6}
              maxLength={2000}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              required
            />
            {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
            <p className="text-xs text-muted-foreground mt-1">{form.message.length} / 2000</p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" /> Enviar mensaje
          </button>
        </form>

        <div className="mt-12 p-5 bg-muted/50 rounded-xl text-sm">
          <p className="font-medium mb-2">Contacto directo</p>
          <p className="text-muted-foreground">
            También puedes escribirme directamente a:{" "}
            {RECIPIENTS.map((r, i) => (
              <span key={r}>
                <a href={`mailto:${r}`} className="text-primary underline break-all">{r}</a>
                {i < RECIPIENTS.length - 1 && " · "}
              </span>
            ))}
          </p>
        </div>

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Mateo Fernández Prieto · Todos los derechos reservados
        </footer>
      </div>
    </div>
  );
}
