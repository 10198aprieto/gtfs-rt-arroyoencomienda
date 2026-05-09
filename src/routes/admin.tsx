import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, Send, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { adminLogin, adminLogout, adminMe } from "@/lib/admin/auth.functions";
import { sendIncident } from "@/lib/admin/incidents.functions";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — ArroyoBus" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminPage() {
  const router = useRouter();
  const me = useServerFn(adminMe);
  const login = useServerFn(adminLogin);
  const logout = useServerFn(adminLogout);
  const send = useServerFn(sendIncident);

  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  // Login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Incident form
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    me().then((r) => {
      setAuthed(r.authed);
      setReady(true);
    }).catch(() => setReady(true));
  }, [me]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginErr(null);
    setLoginLoading(true);
    try {
      const r = await login({ data: { username, password } });
      if (r.ok) {
        setAuthed(true);
        setPassword("");
        router.invalidate();
      } else {
        setLoginErr(r.error);
      }
    } catch (err: any) {
      setLoginErr(err?.message || "Error al iniciar sesión");
    } finally {
      setLoginLoading(false);
    }
  }

  async function onLogout() {
    await logout();
    setAuthed(false);
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSending(true);
    try {
      const r = await send({ data: { text } });
      if (r.ok) {
        setFeedback({ ok: true, msg: "✅ Incidencia publicada en el canal." });
        setText("");
      } else {
        setFeedback({ ok: false, msg: r.error || "No se pudo enviar" });
      }
    } catch (err: any) {
      setFeedback({ ok: false, msg: err?.message || "Error inesperado" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-xl px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <header className="mt-6 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Panel de incidencias</h1>
            <p className="text-sm text-muted-foreground">Acceso restringido — solo administrador.</p>
          </div>
        </header>

        {!ready ? (
          <p className="mt-10 text-sm text-muted-foreground">Cargando…</p>
        ) : !authed ? (
          <form onSubmit={onLogin} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div>
              <label className="mb-1 block text-sm font-medium">Usuario</label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Contraseña</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            {loginErr && <p className="text-sm text-destructive">{loginErr}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {loginLoading ? "Entrando…" : "Iniciar sesión"}
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm">
              <span className="text-muted-foreground">Sesión activa</span>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
              </button>
            </div>

            <form onSubmit={onSend} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div>
                <label className="mb-1 block text-sm font-medium">Mensaje de incidencia</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  maxLength={3500}
                  placeholder="Línea Roja: desvío por obras en Av. Castilla hasta las 20:00."
                  className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">{text.length} / 3500</p>
              </div>
              {feedback && (
                <p className={`text-sm ${feedback.ok ? "text-emerald-600" : "text-destructive"}`}>{feedback.msg}</p>
              )}
              <button
                type="submit"
                disabled={sending || text.trim().length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sending ? "Enviando…" : "Publicar en el canal"}
              </button>
              <p className="text-xs text-muted-foreground">
                Se publicará en el canal de Telegram configurado (<code>TELEGRAM_ALERTS_CHAT_ID</code>).
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}