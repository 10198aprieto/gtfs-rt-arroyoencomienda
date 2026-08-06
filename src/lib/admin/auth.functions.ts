import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAdminSession, safeEq } from "./session.server";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(200),
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => loginSchema.parse(d))
  .handler(async ({ data }) => {
    const u = process.env.ADMIN_USERNAME;
    const p = process.env.ADMIN_PASSWORD;
    const s = process.env.SESSION_SECRET;
    const missing = [
      !u && "ADMIN_USERNAME",
      !p && "ADMIN_PASSWORD",
      (!s || s.length < 32) && "SESSION_SECRET (mín. 32 caracteres)",
    ].filter(Boolean) as string[];
    if (missing.length > 0) {
      return {
        ok: false as const,
        error: `Faltan variables de entorno en este despliegue: ${missing.join(", ")}. Añádelas en Vercel → Settings → Environment Variables y vuelve a desplegar.`,
      };
    }
    const ok = safeEq(data.username, u!) && safeEq(data.password, p!);
    if (!ok) {
      await new Promise((r) => setTimeout(r, 400));
      return { ok: false as const, error: "Credenciales incorrectas" };
    }
    const session = await getAdminSession();
    await session.update({ admin: true, loggedAt: Date.now() });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAdminSession();
  await session.clear();
  return { ok: true as const };
});

export const adminMe = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const session = await getAdminSession();
    return { authed: !!session.data.admin };
  } catch {
    return { authed: false };
  }
});