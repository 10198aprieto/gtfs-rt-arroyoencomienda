import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Badge "X personas viendo ahora" usando Supabase Realtime Presence.
 * Sin tabla, sin escritura — cada navegador anuncia su presencia en el canal.
 */
export default function PresenceBadge({ channel = "arroyobus-home" }: { channel?: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ch = supabase.channel(channel, { config: { presence: { key: id } } });
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState();
      setCount(Object.keys(state).length);
    });
    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") await ch.track({ at: Date.now() });
    });
    return () => { supabase.removeChannel(ch); };
  }, [channel]);

  if (count == null || count < 1) return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold backdrop-blur"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <Eye className="w-3.5 h-3.5" />
      {count === 1 ? "1 persona viendo ahora" : `${count} personas viendo ahora`}
    </div>
  );
}