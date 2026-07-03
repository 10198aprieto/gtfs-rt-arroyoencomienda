import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, Send, ShieldCheck, Save, RotateCcw, KeyRound, ExternalLink, MessageCircle, Map, Search, Activity, AlertTriangle, Trash2, Radio } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { adminLogin, adminLogout, adminMe } from "@/lib/admin/auth.functions";
import { sendIncident } from "@/lib/admin/incidents.functions";
import { getAllSettings, updateSetting, resetSetting, listSecretsStatus, DEFAULT_SETTINGS } from "@/lib/admin/settings.functions";
import { createAlert, listAlertsAdmin, deactivateAlert, CAUSE_LABELS, EFFECT_LABELS, CAUSES, EFFECTS } from "@/lib/admin/alerts.functions";
import stopsData from "@/data/stops.json";

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

            <AlertsPanel />

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
    { title: "Canal de Telegram", desc: "Difusión oficial de avisos en Telegram.", url: "https://t.me/arroyobus", icon: TelegramIcon, primary: true, tint: "sky" as const },
    { title: "Canal de WhatsApp", desc: "Recibe los avisos también en WhatsApp.", url: "https://whatsapp.com/channel/0029Vb8UC0KCBtx7VxjSsq2m", icon: WhatsappIcon, primary: true, tint: "emerald" as const },
    { title: "Bot de Telegram", desc: "Abrir conversación con @arroyobus_bot.", url: "https://t.me/arroyobus_bot", icon: TelegramIcon, primary: true, tint: "sky" as const },
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
            className={`flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-accent transition-colors ${
              (it as any).tint === "emerald" ? "bg-emerald-500/10 border-emerald-500/30" :
              (it as any).tint === "sky" ? "bg-sky-500/10 border-sky-500/30" :
              it.primary ? "bg-primary/5" : ""
            }`}
          >
            <it.icon className={`h-5 w-5 mt-0.5 shrink-0 ${
              (it as any).tint === "emerald" ? "text-emerald-600" :
              (it as any).tint === "sky" ? "text-sky-600" :
              it.primary ? "text-primary" : "text-muted-foreground"
            }`} />
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

function TelegramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M9.78 17.6l.34-4.63 8.42-7.6c.37-.34-.08-.5-.57-.21L7.6 11.75 3.11 10.33c-.97-.28-.98-.94.22-1.4l17.5-6.75c.8-.36 1.57.2 1.27 1.42l-2.98 14.05c-.2.94-.77 1.17-1.55.73l-4.28-3.16-2.06 2c-.24.23-.44.44-.9.44-.42 0-.35-.16-.55-.66z"/>
    </svg>
  );
}
function WhatsappIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.65-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.9-2.19-.24-.57-.48-.5-.66-.5h-.57c-.2 0-.52.07-.79.37s-1.05 1.03-1.05 2.5c0 1.48 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.09 4.49.71.3 1.26.48 1.69.62.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.24-.7.24-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12 2C6.48 2 2 6.48 2 12c0 1.9.54 3.68 1.47 5.19L2 22l4.94-1.44A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
    </svg>
  );
}

const ALL_STOPS = (stopsData as Array<{ id: string; name: string }>);
const ROUTES = ["Roja","Azul","Verde","Buho"];

function AlertsPanel() {
  const create = useServerFn(createAlert);
  const list = useServerFn(listAlertsAdmin);
  const deact = useServerFn(deactivateAlert);

  const [items, setItems] = useState<any[] | null>(null);
  const [header, setHeader] = useState("");
  const [desc, setDesc] = useState("");
  const [cause, setCause] = useState<string>("CONSTRUCTION");
  const [effect, setEffect] = useState<string>("DETOUR");
  const [stopIds, setStopIds] = useState<string[]>([]);
  const [routeIds, setRouteIds] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [stopSearch, setStopSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() { try { setItems(await list()); } catch { setItems([]); } }
  useEffect(() => { refresh(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const r = await create({ data: {
        header, description: desc, cause: cause as any, effect: effect as any,
        stop_ids: stopIds, route_ids: routeIds,
        url: url || undefined,
        ends_at: endsAt ? new Date(endsAt).toISOString() : undefined,
      }});
      if (r.ok) {
        setMsg("✅ Aviso publicado en /avisos");
        setHeader(""); setDesc(""); setStopIds([]); setRouteIds([]); setUrl(""); setEndsAt("");
        refresh();
      } else setMsg("❌ " + r.error);
    } catch (err: any) { setMsg("❌ " + (err?.message || "Error")); }
    finally { setBusy(false); }
  }

  const filtered = stopSearch ? ALL_STOPS.filter(s => (s.name+s.id).toLowerCase().includes(stopSearch.toLowerCase())).slice(0,20) : [];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
      <header className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-bold">Publicar aviso en /avisos</h2>
      </header>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1">Encabezamiento *</label>
          <input required maxLength={200} value={header} onChange={e=>setHeader(e.target.value)}
            placeholder="Desvío por obras en Av. Castilla"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Descripción</label>
          <textarea rows={3} maxLength={2000} value={desc} onChange={e=>setDesc(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Causa</label>
            <select value={cause} onChange={e=>setCause(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {CAUSES.map(c => <option key={c} value={c}>{CAUSE_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Efecto</label>
            <select value={effect} onChange={e=>setEffect(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {EFFECTS.map(c => <option key={c} value={c}>{EFFECT_LABELS[c]}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Líneas afectadas (opcional)</label>
          <div className="flex flex-wrap gap-2">
            {ROUTES.map(r => {
              const on = routeIds.includes(r);
              return (
                <button type="button" key={r}
                  onClick={() => setRouteIds(on ? routeIds.filter(x=>x!==r) : [...routeIds, r])}
                  className={`text-xs px-2.5 py-1 rounded-full border ${on ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Paradas afectadas (opcional)</label>
          <input value={stopSearch} onChange={e=>setStopSearch(e.target.value)}
            placeholder="Buscar por nombre o id…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          {filtered.length > 0 && (
            <div className="mt-1 max-h-40 overflow-auto rounded-md border border-border">
              {filtered.map(s => {
                const on = stopIds.includes(s.id);
                return (
                  <button type="button" key={s.id} onClick={() => setStopIds(on ? stopIds.filter(x=>x!==s.id) : [...stopIds, s.id])}
                    className={`w-full text-left text-xs px-3 py-1.5 hover:bg-accent ${on ? "bg-primary/10" : ""}`}>
                    <span className="font-mono text-muted-foreground mr-2">{s.id}</span>{s.name} {on && "✓"}
                  </button>
                );
              })}
            </div>
          )}
          {stopIds.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {stopIds.map(id => {
                const s = ALL_STOPS.find(x=>x.id===id);
                return (
                  <span key={id} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary">
                    {s?.name || id}
                    <button type="button" onClick={()=>setStopIds(stopIds.filter(x=>x!==id))} className="ml-1 hover:text-destructive">×</button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">URL (opcional)</label>
            <input type="url" value={url} onChange={e=>setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Fecha fin (opcional)</label>
            <input type="datetime-local" value={endsAt} onChange={e=>setEndsAt(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        {msg && <p className={`text-xs ${msg.startsWith("✅")?"text-emerald-600":"text-destructive"}`}>{msg}</p>}
        <button type="submit" disabled={busy || !header.trim()}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">
          <Radio className="h-4 w-4" /> {busy ? "Publicando…" : "Publicar aviso"}
        </button>
      </form>

      <div className="border-t border-border pt-4">
        <p className="text-xs font-semibold mb-2">Avisos activos</p>
        {items === null && <p className="text-xs text-muted-foreground">Cargando…</p>}
        {items && items.length === 0 && <p className="text-xs text-muted-foreground">Sin avisos publicados.</p>}
        <ul className="space-y-1.5">
          {items?.filter(a=>a.active).map(a => (
            <li key={a.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs">
              <span className="truncate"><strong>{a.header}</strong> <span className="text-muted-foreground">— {EFFECT_LABELS[a.effect]||a.effect}</span></span>
              <button onClick={async()=>{ await deact({data:{id:a.id}}); refresh(); }}
                className="inline-flex items-center gap-1 text-destructive hover:underline">
                <Trash2 className="h-3 w-3" /> desactivar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}