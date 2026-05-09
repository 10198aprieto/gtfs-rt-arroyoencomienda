import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";
import { timingSafeEqual } from "crypto";

type SessionData = { admin?: boolean; loggedAt?: number };

function getSessionConfig() {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET no configurado o demasiado corto (mín 32 chars)");
  }
  return {
    password,
    name: "arroyobus_admin",
    maxAge: 60 * 60 * 8, // 8h
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function safeEq(a: string, b: string): boolean {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  if (A.length !== B.length) {
    // Compare against itself to keep constant-ish time
    timingSafeEqual(A, A);
    return false;
  }
  return timingSafeEqual(A, B);
}

const loginSchema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(200),
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => loginSchema.parse(d))
  .handler(async ({ data }) => {
    const u = process.env.ADMIN_USERNAME;
    const p = process.env.ADMIN_PASSWORD;
    if (!u || !p) {
      return { ok: false as const, error: "Admin no configurado en el servidor" };
    }
    const ok = safeEq(data.username, u) && safeEq(data.password, p);
    if (!ok) {
      // Pequeño delay para mitigar enumeración
      await new Promise((r) => setTimeout(r, 400));
      return { ok: false as const, error: "Credenciales incorrectas" };
    }
    const session = await useSession<SessionData>(getSessionConfig());
    await session.update({ admin: true, loggedAt: Date.now() });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<SessionData>(getSessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const adminMe = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const session = await useSession<SessionData>(getSessionConfig());
    return { authed: !!session.data.admin };
  } catch {
    return { authed: false };
  }
});

export async function requireAdmin(): Promise<void> {
  const session = await useSession<SessionData>(getSessionConfig());
  if (!session.data.admin) {
    throw new Response("Unauthorized", { status: 401 });
  }
}