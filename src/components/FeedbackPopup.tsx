import { useEffect, useState } from "react";
import { X, MessageSquareText } from "lucide-react";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd4h6w3SW26d-86OADwiaCgL-lU8lrW2NKDXWUwfsb96To2yA/viewform?usp=dialog";
const KEY = "arroyobus_feedback_popup_v1";

export default function FeedbackPopup() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {}
    const t = setTimeout(() => setOpen(true), 6000);
    return () => clearTimeout(t);
  }, []);
  function dismiss() {
    setOpen(false);
    try { localStorage.setItem(KEY, String(Date.now())); } catch {}
  }
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={dismiss}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary"><MessageSquareText className="h-5 w-5" /></div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">¿Nos ayudas con una encuesta?</h3>
            <p className="text-sm text-muted-foreground mt-1">Tu opinión mejora ArroyoBus. Solo son 2 minutos.</p>
          </div>
          <button onClick={dismiss} aria-label="Cerrar" className="rounded-md p-1 text-muted-foreground hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 flex gap-2">
          <a href={FORM_URL} target="_blank" rel="noopener noreferrer" onClick={dismiss}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90">
            Abrir encuesta
          </a>
          <button onClick={dismiss} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent">Ahora no</button>
        </div>
      </div>
    </div>
  );
}