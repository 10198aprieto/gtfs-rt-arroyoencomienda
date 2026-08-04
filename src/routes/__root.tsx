import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import CookieBanner from "@/components/CookieBanner";
import MarqueeBanner from "@/components/MarqueeBanner";
import FeedbackPopup from "@/components/FeedbackPopup";
import AnalyticsLoader from "@/components/AnalyticsLoader";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "cS_rG7SsHrlvv4jHeuOtAE0YF70QWplwNVSxG4mm61I" },
      { name: "google-site-verification", content: "X9Z7x_mDLlvjkmhn9y_27VS9IQGM3XICEwtJwUaA77o" },
      { title: "ArroyoBus — Autobuses en tiempo real" },
      { name: "description", content: "ArroyoBus — sigue en tiempo real los autobuses de Arroyo de la Encomienda. Llegadas, posiciones GPS y tu tarjeta Buscyl en el bolsillo." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "ArroyoBus — Autobuses en tiempo real" },
      { property: "og:description", content: "ArroyoBus — sigue en tiempo real los autobuses de Arroyo de la Encomienda. Llegadas, posiciones GPS y tu tarjeta Buscyl en el bolsillo." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ArroyoBus" },
      { property: "og:locale", content: "es_ES" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "ArroyoBus — Autobuses en tiempo real" },
      { name: "twitter:description", content: "ArroyoBus — sigue en tiempo real los autobuses de Arroyo de la Encomienda. Llegadas, posiciones GPS y tu tarjeta Buscyl en el bolsillo." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/q96k7LEcw9b6oVavZiCePAkLYvu1/social-images/social-1779626093161-Sigue_en_tiempo_real_los_autobuses_de_Arroyo_de_Encomnienda_Llegadas,_positiones_GPS_y_tu_tarjeta_Buscyl_en_la_bosbilio._(1).webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/q96k7LEcw9b6oVavZiCePAkLYvu1/social-images/social-1779626093161-Sigue_en_tiempo_real_los_autobuses_de_Arroyo_de_Encomnienda_Llegadas,_positiones_GPS_y_tu_tarjeta_Buscyl_en_la_bosbilio._(1).webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: "ArroyoBus",
              url: "https://arroyobus.lovable.app",
              inLanguage: "es-ES",
              description:
                "Seguimiento en tiempo real de los autobuses urbanos de Arroyo de la Encomienda: llegadas, posiciones GPS y avisos del servicio.",
            },
            {
              "@type": "Organization",
              name: "ArroyoBus",
              url: "https://arroyobus.lovable.app",
              description:
                "Proyecto independiente que publica datos abiertos del transporte urbano de Arroyo de la Encomienda (Valladolid).",
            },
          ],
        }),
      },
      {
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7982425877279613",
        async: true,
        crossOrigin: "anonymous",
      },
      {
        src: "https://arsys.ai-voicereceptionist.com/widget/v1/embed.js",
        "data-agent-id": "7a40ddf6-aa38-49c2-89e4-8cb43d4b0813",
        defer: true,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <MarqueeBanner />
      <Outlet />
      <CookieBanner />
      <FeedbackPopup />
      <AnalyticsLoader />
    </>
  );
}
