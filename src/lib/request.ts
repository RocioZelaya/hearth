import { headers } from "next/headers";
import { hashIp } from "./hash";

/**
 * Best-effort client IP from proxy headers, already hashed.
 *
 * Assumes the app sits behind one trusted reverse proxy (Vercel, Railway,
 * nginx…) that appends the real client to `x-forwarded-for`; we read the
 * LAST hop, the one the proxy wrote, so a visitor can't spoof an earlier
 * one. Without any proxy every visitor shares the "local" bucket, which is
 * fine for `next dev` and wrong for production: put a proxy in front.
 */
export async function getVisitorHash(): Promise<string> {
  const h = await headers();
  const hops = h.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const ip = hops.at(-1) || h.get("x-real-ip") || "local";
  return hashIp(ip);
}
