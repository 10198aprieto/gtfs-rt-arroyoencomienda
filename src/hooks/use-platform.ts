import { useEffect, useState } from "react";

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIphoneIpod = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as Macintosh but is touch-capable
  const isIpadOS = /Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document;
  return isIphoneIpod || isIpadOS;
}

/**
 * Returns true only on Apple mobile devices (iPhone / iPad).
 * SSR-safe: always false on first render, resolved after hydration.
 */
export function useIsIOS(): boolean {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const value = detectIOS();
    setIsIOS(value);
    const root = document.documentElement;
    root.classList.toggle("is-ios", value);
    root.classList.toggle("is-android", !value && /Android/i.test(navigator.userAgent));
  }, []);

  return isIOS;
}

/** Light haptic feedback where the platform supports it (no-op on iOS Safari). */
export function haptic(pattern: number | number[] = 8) {
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}
