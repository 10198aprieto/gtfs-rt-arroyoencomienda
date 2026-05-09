import { useSession } from "@tanstack/react-start/server";
import { timingSafeEqual } from "crypto";

export type SessionData = { admin?: boolean; loggedAt?: number };

export function getSessionConfig() {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET no configurado o demasiado corto (mín 32 chars)");
  }
  return {
    password,
    name: "arroyobus_admin",
    maxAge: 60 * 60 * 8,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export function safeEq(a: string, b: string): boolean {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  if (A.length !== B.length) {
    timingSafeEqual(A, A);
    return false;
  }
  return timingSafeEqual(A, B);
}

export async function getAdminSession() {
  return useSession<SessionData>(getSessionConfig());
}

export async function requireAdmin(): Promise<void> {
  const session = await getAdminSession();
  if (!session.data.admin) {
    throw new Response("Unauthorized", { status: 401 });
  }
}