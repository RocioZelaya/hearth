import { describe, expect, it } from "vitest";
import { detectProvider, parsePaymentUrl, providerLabel } from "./payment-links";

describe("parsePaymentUrl", () => {
  it("accepts a plain https link", () => {
    const result = parsePaymentUrl("https://paypal.me/ana");
    expect(result).toEqual({ ok: true, url: "https://paypal.me/ana", provider: "paypal" });
  });

  it("upgrades a bare host to https", () => {
    const result = parsePaymentUrl("  mpago.la/cafe  ");
    expect(result).toMatchObject({ ok: true, url: "https://mpago.la/cafe", provider: "mercadopago" });
  });

  it("rejects http", () => {
    expect(parsePaymentUrl("http://paypal.me/ana")).toMatchObject({ ok: false });
  });

  it("rejects javascript and other schemes", () => {
    expect(parsePaymentUrl("javascript:alert(1)")).toMatchObject({ ok: false });
    expect(parsePaymentUrl("mailto:someone@example.com")).toMatchObject({ ok: false });
  });

  it("rejects credentials in the url", () => {
    expect(parsePaymentUrl("https://user:pw@paypal.me/ana")).toMatchObject({ ok: false });
  });

  it("rejects hosts that are not public", () => {
    expect(parsePaymentUrl("https://localhost/x")).toMatchObject({ ok: false });
    expect(parsePaymentUrl("")).toMatchObject({ ok: false });
  });

  it("rejects ip literals", () => {
    expect(parsePaymentUrl("https://127.0.0.1/x")).toMatchObject({ ok: false });
    expect(parsePaymentUrl("https://10.0.0.1/pay")).toMatchObject({ ok: false });
    expect(parsePaymentUrl("https://[::1]/pay")).toMatchObject({ ok: false });
  });

  it("keeps the query string", () => {
    expect(parsePaymentUrl("https://paypal.me/ana?country=ar")).toMatchObject({
      url: "https://paypal.me/ana?country=ar",
    });
  });

  it("drops the fragment", () => {
    expect(parsePaymentUrl("https://ko-fi.com/me#top")).toMatchObject({ url: "https://ko-fi.com/me" });
  });
});

describe("detectProvider", () => {
  it("matches exact and parent hosts", () => {
    expect(detectProvider("paypal.me")).toBe("paypal");
    expect(detectProvider("www.paypal.com")).toBe("paypal");
    expect(detectProvider("link.mercadopago.com.ar")).toBe("mercadopago");
    expect(detectProvider("https://buymeacoffee.com/x")).toBe("bmac");
  });

  it("does not match look-alike hosts", () => {
    expect(detectProvider("notpaypal.com")).toBe("other");
    expect(detectProvider("paypal.com.evil.io")).toBe("other");
  });
});

describe("providerLabel", () => {
  it("has a friendly label for every provider", () => {
    expect(providerLabel("mercadopago")).toBe("mercado pago");
    expect(providerLabel("other")).toBe("payment link");
  });
});
