import { useEffect } from "react";

/**
 * Modo oscuro:
 *  1. Preferencia manual del usuario (localStorage "arroyobus.theme").
 *  2. Si no la hay: modo oscuro del sistema (iPhone/Android) o franja nocturna 21:00–07:00.
 */
function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export default function AutoNightMode() {
  useEffect(() => {
    const apply = () => {
      const override = localStorage.getItem("arroyobus.theme");
      const h = new Date().getHours();
      const dark = override ? override === "dark" : systemPrefersDark() || h >= 21 || h < 7;
      document.documentElement.classList.toggle("dark", dark);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", dark ? "#0b1120" : "#1d4ed8");
      window.dispatchEvent(new CustomEvent("arroyobus:theme-applied", { detail: { dark } }));
    };
    apply();
    const id = setInterval(apply, 60_000);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener?.("change", apply);
    window.addEventListener("arroyobus:theme", apply);
    return () => {
      clearInterval(id);
      mq.removeEventListener?.("change", apply);
      window.removeEventListener("arroyobus:theme", apply);
    };
  }, []);
  return null;
}

export function isNightNow() {
  if (typeof window === "undefined") return false;
  const override = localStorage.getItem("arroyobus.theme");
  if (override) return override === "dark";
  const h = new Date().getHours();
  return systemPrefersDark() || h >= 21 || h < 7;
}
