import { useEffect, useState } from "react";

const STORAGE_KEY = "arroyobus_cookie_consent";
const GA_ID = "G-QB86L2QP32";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __arroyobusGaLoaded?: boolean;
  }
}

function readConsent(): "accepted" | "rejected" | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.value === "accepted" ? "accepted" : parsed?.value === "rejected" ? "rejected" : null;
  } catch {
    return null;
  }
}

function loadGa() {
  if (typeof window === "undefined" || window.__arroyobusGaLoaded) return;
  window.__arroyobusGaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag as typeof window.gtag;
  gtag("js", new Date());
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  gtag("config", GA_ID, { anonymize_ip: true });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

export default function AnalyticsLoader() {
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);

  useEffect(() => {
    setConsent(readConsent());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setConsent(readConsent());
    };
    const onCustom = () => setConsent(readConsent());
    window.addEventListener("storage", onStorage);
    window.addEventListener("arroyobus:consent-changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("arroyobus:consent-changed", onCustom);
    };
  }, []);

  useEffect(() => {
    if (consent === "accepted") loadGa();
  }, [consent]);

  return null;
}