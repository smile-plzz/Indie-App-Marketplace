/**
 * Single-editor authentication. No login screen was designed, but a public
 * write surface is unacceptable, so this is the smallest safe thing: one
 * password in the environment, exchanged for an HMAC-signed cookie.
 *
 * Built on Web Crypto so the same code verifies in middleware (Edge) and in
 * route handlers (Node) without a second implementation.
 */

export const SESSION_COOKIE = "studio_session";
const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours: one working session.

function encoder() {
  return new TextEncoder();
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function key(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(payload: string, secret: string) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await key(secret),
    encoder().encode(payload),
  );
  return toBase64Url(signature);
}

/** Constant-time string compare: a fast reject leaks the shared secret. */
function equal(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

export async function createSession(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!expected || !secret) return null;
  if (!equal(password, expected)) return null;

  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `editor.${expires}`;
  return {
    value: `${payload}.${await sign(payload, secret)}`,
    maxAge: SESSION_MAX_AGE,
  };
}

export async function verifySession(token: string | undefined) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!token || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [subject, expires, signature] = parts;

  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  return equal(signature, await sign(`${subject}.${expires}`, secret));
}
