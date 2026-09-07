/**
 * Cliente admin de Supabase con saneado de credenciales.
 *
 * En Vercel (y otros despliegues) es frecuente que SUPABASE_SERVICE_ROLE_KEY
 * se pegue con un espacio o salto de línea al final, lo que provoca:
 *   TypeError: Headers.set: "<jwt>" is an invalid header value.
 * Aquí limpiamos las variables antes de crear el cliente generado.
 */
for (const key of ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"] as const) {
  const v = process.env[key];
  if (typeof v === "string") {
    const clean = v.trim().replace(/[\r\n]+/g, "");
    if (clean !== v) process.env[key] = clean;
  }
}

export { supabaseAdmin } from "@/integrations/supabase/client.server";
