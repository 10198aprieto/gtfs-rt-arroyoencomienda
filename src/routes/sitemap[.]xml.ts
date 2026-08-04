import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { STOP_SLUGS } from "@/data/stop-slugs";

const BASE_URL = "https://arroyobus.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/app", changefreq: "daily", priority: "0.9" },
          { path: "/avisos", changefreq: "daily", priority: "0.8" },
          { path: "/asistentes", changefreq: "monthly", priority: "0.6" },
          { path: "/contacto", changefreq: "yearly", priority: "0.5" },
          { path: "/aviso-legal", changefreq: "yearly", priority: "0.3" },
          { path: "/politica-privacidad", changefreq: "yearly", priority: "0.3" },
          { path: "/politica-cookies", changefreq: "yearly", priority: "0.3" },
          ...Object.values(STOP_SLUGS).map((slug) => ({
            path: `/parada/${slug}`,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
