import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import type { Express, Request, Response } from "express";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { sdk } from "./sdk";

const LOCAL_ADMIN_OPEN_ID = "local-admin";

function buildLocalBootstrapUser(): User {
  const now = new Date();

  return {
    id: 0,
    openId: LOCAL_ADMIN_OPEN_ID,
    name: "Admin Local",
    email: ENV.adminEmail,
    loginMethod: "local",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const computed = scryptSync(password, salt, 64);
  const original = Buffer.from(hash, "hex");
  if (computed.length !== original.length) return false;
  return timingSafeEqual(computed, original);
}

async function ensureBootstrapAdmin() {
  const database = await db.getDb();
  if (!database) {
    return buildLocalBootstrapUser();
  }

  await db.upsertUser({
    openId: LOCAL_ADMIN_OPEN_ID,
    name: "Admin Local",
    email: ENV.adminEmail,
    loginMethod: "local",
    role: "admin",
    lastSignedIn: new Date(),
  });

  const user = await db.getUserByOpenId(LOCAL_ADMIN_OPEN_ID);
  if (!user) {
    throw new Error("No se pudo crear el usuario admin bootstrap");
  }

  const existingProfile = await db.getBusinessProfile(user.id);
  if (!existingProfile) {
    await db.upsertBusinessProfile(user.id, {
      slug: "mi-negocio-local",
      businessName: "Mi Negocio (Local Dev)",
      tagline: "Perfil creado automáticamente para desarrollo local",
    });
  }

  await db.upsertLocalAdminCredential(user.id, {
    email: ENV.adminEmail,
    passwordHash: hashPassword(ENV.adminPassword),
  });

  return user;
}

async function createSessionForUser(
  res: Response,
  user: { openId: string; name?: string | null }
) {
  const sessionToken = await sdk.signSession(
    {
      openId: user.openId,
      appId: "local-dev",
      name: user.name ?? "Admin Local",
    },
    { expiresInMs: ONE_YEAR_MS }
  );

  res.cookie(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: ENV.isProduction,
    path: "/",
    maxAge: ONE_YEAR_MS,
  });
}

export function registerLocalAuthRoutes(app: Express) {
  if (!ENV.localAuthEnabled) return;

  console.log("[LocalAuth] Local auth enabled — /api/auth/local-login active");

  app.post("/api/auth/local-login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "email y password son requeridos" });
      return;
    }

    try {
      const normalizedEmail = String(email).trim().toLowerCase();

      // 1) Credenciales locales por página
      const credential = await db.getLocalAdminCredentialByEmail(normalizedEmail);
      if (credential) {
        const validPassword = verifyPassword(String(password), credential.passwordHash);
        if (!validPassword) {
          res.status(401).json({ error: "Credenciales incorrectas" });
          return;
        }

        const user = await db.getUserById(credential.userId);
        if (!user) {
          res.status(500).json({ error: "Usuario admin no encontrado" });
          return;
        }

        await db.upsertUser({
          openId: user.openId,
          name: user.name ?? "Admin",
          email: normalizedEmail,
          loginMethod: "local",
          role: "admin",
          lastSignedIn: new Date(),
        });

        await createSessionForUser(res, user);
        res.json({ ok: true });
        return;
      }

      // 2) Admin bootstrap del proyecto
      if (!ENV.adminEmail || !ENV.adminPassword) {
        res.status(401).json({ error: "Credenciales incorrectas" });
        return;
      }

      if (
        normalizedEmail !== ENV.adminEmail.trim().toLowerCase() ||
        String(password) !== ENV.adminPassword
      ) {
        res.status(401).json({ error: "Credenciales incorrectas" });
        return;
      }

      const bootstrapUser = await ensureBootstrapAdmin();
      await createSessionForUser(res, bootstrapUser);
      res.json({ ok: true });
    } catch (error) {
      console.error("[LocalAuth] Login failed:", error);
      res.status(500).json({ error: "Error interno al crear sesión" });
    }
  });

  app.get("/api/auth/local-status", (_req: Request, res: Response) => {
    res.json({ localAuthEnabled: ENV.localAuthEnabled });
  });
}
