import { useEffect } from "react";

/** Modo nocturno automático (21:00–07:00) salvo que el usuario lo fije a mano. */
export default function AutoNightMode() {
  useEffect(() => {
    const apply = () => {
      const override = localStorage.getItem("arroyobus.theme");
      const h = new Date().getHours();
      const night = override ? override === "dark" : h >= 21 || h < 7;
      document.documentElement.classList.toggle("dark", night);
    };
    apply();
    const id = setInterval(apply, 60_000);
    window.addEventListener("arroyobus:theme", apply);
    return () => {
      clearInterval(id);
      window.removeEventListener("arroyobus:theme", apply);
    };
  }, []);
  return null;
}

export function isNightNow() {
  const h = new Date().getHours();
  const override = typeof window !== "undefined" ? localStorage.getItem("arroyobus.theme") : null;
  return override ? override === "dark" : h >= 21 || h < 7;
}
