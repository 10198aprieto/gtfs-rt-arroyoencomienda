import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "arroyobus_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (!v) setVisible(true);
    } catch {
      // ignore (private mode etc.)
    }
  }, []);

  const decide = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ value, ts: Date.now() })
      );
    } catch {}
    try {
      window.dispatchEvent(new CustomEvent("arroyobus:consent-changed", { detail: { value } }));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[1000] p-3 sm:p-4 pointer-events-none"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="pointer-events-auto max-w-3xl mx-auto rounded-2xl border border-border bg-card/95 backdrop-blur shadow-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-1">Usamos cookies técnicas</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ArroyoBus solo utiliza cookies y almacenamiento local estrictamente
              necesarios para el funcionamiento del sitio (recordar tu decisión y guardar
              tus tarjetas Buscyl). No usamos cookies publicitarias ni de análisis de
              terceros. Puedes consultar la{" "}
              <Link to="/politica-cookies" className="underline text-foreground hover:text-primary">
                Política de Cookies
              </Link>{" "}
              y la{" "}
              <Link to="/politica-privacidad" className="underline text-foreground hover:text-primary">
                Política de Privacidad
              </Link>
              .
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => decide("accepted")}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Aceptar
              </button>
              <button
                onClick={() => decide("rejected")}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-accent transition-colors"
              >
                Rechazar
              </button>
              <Link
                to="/politica-cookies"
                className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Más información
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}