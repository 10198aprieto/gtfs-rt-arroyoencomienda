import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { VAPID_PUBLIC_KEY } from "@/lib/push/config";
import { savePushSubscription, deletePushSubscription } from "@/lib/push/push.functions";
import { loadPlaces } from "@/lib/favorites";

type State = "loading" | "unsupported" | "iframe" | "ios-install" | "denied" | "off" | "on";

function b64ToBytes(b64: string) {
  const s = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

export default function PushToggle() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const save = useServerFn(savePushSubscription);
  const del = useServerFn(deletePushSubscription);

  const sync = async (sub: PushSubscription) => {
    const j = sub.toJSON() as any;
    await save({ data: { endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, stopIds: loadPlaces().map((p) => p.stopId), alerts: true, arrivals: true } });
  };

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
        return setState(ios ? "ios-install" : "unsupported");
      }
      if (window.top !== window.self) return setState("iframe");
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.register("/sw-push.js");
      const sub = await reg.pushManager.getSubscription();
      if (sub) { setState("on"); sync(sub).catch(() => {}); } else setState("off");
    })().catch(() => setState("unsupported"));
    // Al cambiar favoritos, actualiza las paradas vigiladas
    const onFav = async () => {
      const reg = await navigator.serviceWorker?.getRegistration("/sw-push.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) sync(sub).catch(() => {});
    };
    window.addEventListener("arroyobus:favorites", onFav);
    return () => window.removeEventListener("arroyobus:favorites", onFav);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw-push.js");
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await del({ data: { endpoint: existing.endpoint } }).catch(() => {});
        await existing.unsubscribe();
        setState("off");
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return setState("denied");
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(VAPID_PUBLIC_KEY) });
      await sync(sub);
      setState("on");
    } catch {
      setState("unsupported");
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading") return null;
  const msg: Partial<Record<State, string>> = {
    unsupported: "Tu navegador no admite notificaciones.",
    iframe: "Abre la web en una pestaña propia para activar las notificaciones.",
    "ios-install": "En iPhone: pulsa Compartir → «Añadir a pantalla de inicio» y abre ArroyoBus desde ahí para activar notificaciones.",
    denied: "Has bloqueado las notificaciones. Actívalas en los ajustes del navegador para esta web.",
  };

  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <div className="p-2 rounded-full bg-primary/10 text-primary">
        {state === "on" ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">Notificaciones</div>
        <div className="text-xs text-muted-foreground">
          {msg[state] ?? (state === "on"
            ? "Recibirás avisos, incidencias y cuándo llega el bus a tus paradas favoritas."
            : "Avisos, incidencias y bus llegando a tus paradas favoritas.")}
        </div>
      </div>
      {(state === "on" || state === "off") && (
        <button
          onClick={toggle}
          disabled={busy}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${state === "on" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}
        >
          {state === "on" ? "Desactivar" : "Activar"}
        </button>
      )}
    </div>
  );
}
