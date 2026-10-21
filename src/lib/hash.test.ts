import { afterEach, describe, expect, it, vi } from "vitest";
import { hashIp, unitHash } from "./hash";

describe("unitHash", () => {
  it("is deterministic and stays in [0, 1)", () => {
    const ids = ["cmvhftps400006f2gqucts2m3", "a", "", "another-id"];
    for (const id of ids) {
      const h = unitHash(id);
      expect(h).toBe(unitHash(id));
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(1);
    }
    expect(unitHash("a")).not.toBe(unitHash("b"));
  });
});

describe("hashIp", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("never returns the raw ip and depends on the salt", () => {
    vi.stubEnv("IP_HASH_SALT", "one");
    const a = hashIp("203.0.113.9");
    vi.stubEnv("IP_HASH_SALT", "two");
    const b = hashIp("203.0.113.9");
    expect(a).not.toContain("203.0.113");
    expect(a).not.toBe(b);
    expect(a).toHaveLength(32);
  });

  it("refuses to run in production without a real salt", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("IP_HASH_SALT", "change-me");
    expect(() => hashIp("203.0.113.9")).toThrow(/IP_HASH_SALT/);
  });
});
