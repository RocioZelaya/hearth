/**
 * Payment links are the only way a note's author gets contacted, so we are
 * strict about what we accept (https only) and friendly about what we show
 * (a label for the provider we recognised).
 *
 * To add a provider: append an entry to PROVIDERS. Hosts match exactly or as
 * a parent domain (`paypal.com` also matches `www.paypal.com`).
 */

export type Provider =
  | "paypal"
  | "mercadopago"
  | "kofi"
  | "bmac"
  | "cashapp"
  | "venmo"
  | "patreon"
  | "other";

type ProviderInfo = { id: Provider; label: string; hosts: string[] };

const PROVIDERS: ProviderInfo[] = [
  { id: "paypal", label: "paypal", hosts: ["paypal.me", "paypal.com"] },
  {
    id: "mercadopago",
    label: "mercado pago",
    hosts: ["mpago.la", "mercadopago.com", "mercadopago.com.ar", "mercadopago.com.br", "mercadopago.com.mx"],
  },
  { id: "kofi", label: "ko-fi", hosts: ["ko-fi.com"] },
  { id: "bmac", label: "buy me a coffee", hosts: ["buymeacoffee.com"] },
  { id: "cashapp", label: "cash app", hosts: ["cash.app"] },
  { id: "venmo", label: "venmo", hosts: ["venmo.com"] },
  { id: "patreon", label: "patreon", hosts: ["patreon.com"] },
];

const OTHER_LABEL = "payment link";

export type ParsedPaymentUrl =
  | { ok: true; url: string; provider: Provider }
  | { ok: false; reason: string };

/**
 * Normalises user input into a canonical https URL. Accepts a bare host
 * ("paypal.me/ana") and upgrades it to https. Rejects anything that is not
 * https, has credentials, or is not a plausible public host.
 */
export function parsePaymentUrl(raw: string): ParsedPaymentUrl {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: "add a link where people can send you money." };

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return { ok: false, reason: "that doesn't look like a link." };
  }

  if (url.protocol !== "https:") {
    return { ok: false, reason: "only https links, please." };
  }
  if (url.username || url.password) {
    return { ok: false, reason: "links can't carry a username or password." };
  }
  if (!looksPublic(url.hostname)) {
    return { ok: false, reason: "that doesn't look like a public link." };
  }

  url.hash = "";
  return { ok: true, url: url.toString(), provider: detectProvider(url.hostname) };
}

/** Which provider a hostname (or full URL) belongs to. */
export function detectProvider(hostOrUrl: string): Provider {
  const host = toHostname(hostOrUrl);
  if (!host) return "other";
  const match = PROVIDERS.find((p) => p.hosts.some((h) => host === h || host.endsWith(`.${h}`)));
  return match?.id ?? "other";
}

/** Human label for a provider id, e.g. "mercado pago". */
export function providerLabel(provider: Provider): string {
  return PROVIDERS.find((p) => p.id === provider)?.label ?? OTHER_LABEL;
}

/** A dotted name, not an IP literal, not localhost-ish. Outbound links only, so this is about junk, not SSRF. */
function looksPublic(hostname: string): boolean {
  if (!hostname.includes(".") || hostname.endsWith(".")) return false;
  if (hostname.startsWith("[")) return false; // IPv6 literal
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return false; // IPv4 literal
  return true;
}

function toHostname(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  try {
    const candidate = /^[a-z][a-z0-9+.-]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(candidate).hostname;
  } catch {
    return null;
  }
}
