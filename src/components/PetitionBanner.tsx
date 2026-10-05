import { useEffect, useState } from "react";
import { PenLine, X, ExternalLink } from "lucide-react";

const STORAGE_KEY = "arroyobus_petition_banner_dismissed";
const PETITION_URL = "https://c.org/bnHz6XLwsT";
const REAPPEAR_MS = 14 * 24 * 60 * 60 * 1000; // vuelve a mostrarse a los 14 días

/**
 * Banner fijo de la petición ciudadana en Change.org por un transporte
 * público digno en Arroyo de la Encomienda. Cerrable; reaparece a los 14 días.
 */
export default function PetitionBanner() {
  const [visible, setVisible] = useState(false);
  const [cookiePending, setCookiePending] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ts = Number(raw);
        if (Number.isFinite(ts) && Date.now() - ts < REAPPEAR_MS) return;
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* modo privado */
    }
    setVisible(true);

    let onConsent: (() => void) | null = null;
    try {
      const consent = localStorage.getItem("arroyobus_cookie_consent");
      if (!consent) {
        setCookiePending(true);
        onConsent = () => setCookiePending(false);
        window.addEventListener("arroyobus:consent-changed", onConsent);
      }
    } catch {
      /* ignore */
    }
    return () => {
      if (onConsent) window.removeEventListener("arroyobus:consent-changed", onConsent);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Petición: Un transporte público digno para Arroyo de la Encomienda"
      className="fixed inset-x-0 bottom-0 z-[990] p-3 pointer-events-none"
      style={{
        paddingBottom: cookiePending
          ? "calc(11rem + env(safe-area-inset-bottom))"
          : "calc(0.75rem + env(safe-area-inset-bottom))",
      }}
    >
      <div className="pointer-events-auto glass-strong max-w-3xl mx-auto rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <PenLine className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug truncate sm:whitespace-normal">
            Un transporte público digno para Arroyo de la Encomienda
          </p>
          <p className="text-[11px] text-muted-foreground leading-snug hidden sm:block">
            Faltan expediciones, información fiable y pago con tarjeta. Pide mejoras firmando la petición.
          </p>
        </div>
        <a
          href={PETITION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ios-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <span className="hidden sm:inline">Firma en Change.org</span>
          <span className="sm:hidden">Firmar</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <button
          onClick={dismiss}
          aria-label="Cerrar aviso de la petición"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
