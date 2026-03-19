import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import * as argon2 from "argon2";
import {
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
} from "@/lib/rate-limit";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}

async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
    const realIp = h.get("x-real-ip");
    if (realIp) return realIp;
  } catch {
    // headers() may throw in some contexts
  }
  return "unknown";
}

function logAuthEvent(params: {
  route: string;
  outcome: "success" | "failure" | "rate_limited" | "error";
  ip?: string;
  errorCode?: string;
}) {
  const { route, outcome, ip, errorCode } = params;
  const payload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    route,
    outcome,
  };
  if (ip) payload.ip = ip;
  if (errorCode) payload.errorCode = errorCode;
  console.info("[auth]", JSON.stringify(payload));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Production: Auth.js uses secure cookies when request URL is https.
  // Set AUTH_TRUST_HOST=true when deploying behind reverse proxy (Cloud Run, etc.).
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);
        const ip = await getClientIp();
        const rateLimitKey = `${ip}:${email}`;

        // Check rate limit before any DB lookup
        const { allowed } = checkRateLimit(rateLimitKey);
        if (!allowed) {
          logAuthEvent({ route: "auth", outcome: "rate_limited", ip });
          const err = new CredentialsSignin("Too many attempts. Please try again later.");
          err.code = "too_many_attempts";
          throw err;
        }

        try {
          const user = await db.user.findUnique({ where: { email } });
          if (!user) {
            recordFailedAttempt(rateLimitKey);
            logAuthEvent({ route: "auth", outcome: "failure", ip });
            return null;
          }

          const valid = await argon2.verify(user.passwordHash, password);
          if (!valid) {
            recordFailedAttempt(rateLimitKey);
            logAuthEvent({ route: "auth", outcome: "failure", ip });
            return null;
          }

          clearFailedAttempts(rateLimitKey);
          logAuthEvent({ route: "auth", outcome: "success", ip });
          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (err) {
          if (err instanceof CredentialsSignin) throw err;
          recordFailedAttempt(rateLimitKey);
          logAuthEvent({
            route: "auth",
            outcome: "error",
            ip,
            errorCode: "DB_OR_VERIFY_ERROR",
          });
          // eslint-disable-next-line no-console -- intentional server-side error logging
          console.error(
            "[auth] authorize error:",
            err instanceof Error ? err.message : "unknown"
          );
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = (token.email as string) ?? "";
        session.user.role = (token.role as string) ?? "";
      }
      return session;
    },
    jwt: ({ token, user }) => {
      if (user && "role" in user) {
        token.sub = user.id;
        token.email = user.email;
        (token as { role?: string }).role = String(user.role);
      }
      return token;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});
