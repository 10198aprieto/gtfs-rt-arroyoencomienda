import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, Send, ShieldCheck, Save, RotateCcw, KeyRound, ExternalLink, MessageCircle, Map, Search, Activity } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { adminLogin, adminLogout, adminMe } from "@/lib/admin/auth.functions";
import { sendIncident } from "@/lib/admin/incidents.functions";
import { getAllSettings, updateSetting, resetSetting, listSecretsStatus, DEFAULT_SETTINGS } from "@/lib/admin/settings.functions";

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

            <SettingsPanel />

            <SecretsPanel />

            <ConnectorsPanel />

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

function SettingsPanel() {
  const fetchAll = useServerFn(getAllSettings);
  const save = useServerFn(updateSetting);
  const reset = useServerFn(resetSetting);
  const [data, setData] = useState<Record<string, { value: string; updated_at: string | null }> | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { fetchAll().then(setData).catch(() => setData({})); }, [fetchAll]);

  if (!data) return <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Cargando ajustes…</div>;

  const fields: Array<{ key: keyof typeof DEFAULT_SETTINGS; label: string; hint: string; type?: "textarea" }> = [
    { key: "gtfs_rt_vehicle_positions_url", label: "URL feed GTFS-RT (vehicle positions)", hint: "Si ActioSAE falla, cambia aquí el proxy / origen del feed." },
    { key: "gtfs_rt_trip_updates_url", label: "URL feed GTFS-RT (trip updates)", hint: "Endpoint JSON o protobuf que devuelve trip updates." },
    { key: "gtfs_static_url", label: "URL del GTFS estático (.zip)", hint: "Por defecto sirve /GTFS_Static.zip desde public/." },
    { key: "san_antonio_banner_text", label: "Texto del banner rodante San Antonio", hint: "Mensaje que aparece en el marquee de todas las páginas.", type: "textarea" },
    { key: "telegram_bot_link", label: "Enlace del bot de Telegram", hint: "Se usa en el botón \"Abrir bot\"." },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
      <header className="flex items-center gap-2">
        <Save className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Ajustes editables</h2>
      </header>
      {msg && <p className="text-xs text-emerald-600">{msg}</p>}
      <div className="space-y-4">
        {fields.map((f) => {
          const current = data[f.key];
          return (
            <div key={f.key} className="space-y-1.5">
              <label className="block text-sm font-medium">{f.label}</label>
              <p className="text-xs text-muted-foreground">{f.hint}</p>
              {f.type === "textarea" ? (
                <textarea
                  defaultValue={current?.value || ""}
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onBlur={async (e) => {
                    if (e.target.value === current?.value) return;
                    setBusy(f.key); setMsg(null);
                    const r = await save({ data: { key: f.key, value: e.target.value } });
                    setBusy(null);
                    if (r.ok) { setMsg(`✅ Guardado: ${f.label}`); setData({ ...data, [f.key]: { value: e.target.value, updated_at: new Date().toISOString() } }); }
                    else setMsg(`❌ ${r.error}`);
                  }}
                />
              ) : (
                <input
                  type="text"
                  defaultValue={current?.value || ""}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                  onBlur={async (e) => {
                    if (e.target.value === current?.value) return;
                    setBusy(f.key); setMsg(null);
                    const r = await save({ data: { key: f.key, value: e.target.value } });
                    setBusy(null);
                    if (r.ok) { setMsg(`✅ Guardado: ${f.label}`); setData({ ...data, [f.key]: { value: e.target.value, updated_at: new Date().toISOString() } }); }
                    else setMsg(`❌ ${r.error}`);
                  }}
                />
              )}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{current?.updated_at ? `Actualizado: ${new Date(current.updated_at).toLocaleString("es-ES")}` : "Valor por defecto"}</span>
                <button
                  type="button"
                  disabled={busy === f.key}
                  onClick={async () => {
                    await reset({ data: { key: f.key } });
                    const fresh = await fetchAll();
                    setData(fresh);
                    setMsg(`↺ Restablecido: ${f.label}`);
                  }}
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 hover:bg-accent"
                >
                  <RotateCcw className="h-3 w-3" /> Restablecer
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">Los cambios se guardan al perder el foco del campo.</p>
    </div>
  );
}

function SecretsPanel() {
  const fetchStatus = useServerFn(listSecretsStatus);
  const [list, setList] = useState<Array<{ name: string; present: boolean }> | null>(null);
  useEffect(() => { fetchStatus().then(setList).catch(() => setList([])); }, [fetchStatus]);
  if (!list) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
      <header className="flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">API keys y secretos</h2>
      </header>
      <p className="text-xs text-muted-foreground">
        Los valores reales se gestionan desde Lovable Cloud por seguridad. Aquí ves cuáles están configurados.
      </p>
      <ul className="text-sm space-y-1.5">
        {list.map((s) => (
          <li key={s.name} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 font-mono text-xs">
            <span>{s.name}</span>
            <span className={s.present ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
              {s.present ? "● Configurado" : "○ Falta"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConnectorsPanel() {
  const items = [
    { title: "Bot de Telegram", desc: "Abrir conversación con @arroyobus_bot.", url: "https://t.me/arroyobus_bot", icon: MessageCircle, primary: true },
    { title: "Google Maps Platform", desc: "Conector para embeds, geocoding y Street View.", url: "https://console.cloud.google.com/google/maps-apis/overview", icon: Map },
    { title: "Google Search Console", desc: "Indexación y rendimiento SEO.", url: "https://search.google.com/search-console", icon: Search },
    { title: "Estado del feed GTFS-RT", desc: "Comprueba ahora mismo si llegan posiciones.", url: "/api/gtfs-rt/vehicle-positions?format=json", icon: Activity },
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
      <header className="flex items-center gap-2">
        <ExternalLink className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Atajos y conectores</h2>
      </header>
      <div className="grid sm:grid-cols-2 gap-2">
        {items.map((it) => (
          <a
            key={it.title}
            href={it.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-accent transition-colors ${it.primary ? "bg-primary/5" : ""}`}
          >
            <it.icon className={`h-5 w-5 mt-0.5 shrink-0 ${it.primary ? "text-primary" : "text-muted-foreground"}`} />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{it.title}</p>
              <p className="text-xs text-muted-foreground">{it.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}