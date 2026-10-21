import { createHash } from "node:crypto";

/** Hashes a visitor IP with a server-side salt so raw IPs are never stored. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${ipSalt()}:${ip}`).digest("hex").slice(0, 32);
}

/** The salt is optional in development and mandatory in production: a known salt makes IPv4 hashes reversible. */
function ipSalt(): string {
  const salt = process.env.IP_HASH_SALT;
  if (salt && salt !== "change-me") return salt;
  if (process.env.NODE_ENV === "production") {
    throw new Error("IP_HASH_SALT must be set to a random secret in production.");
  }
  return "dev-salt";
}

/** Small deterministic hash of any string, in [0, 1). Used for note tilt. */
export function unitHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}
