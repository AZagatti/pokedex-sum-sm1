import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { cachedFetch, clearCache } from "./cache";

describe("cachedFetch", () => {
  beforeEach(() => {
    clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("fetches and parses on first call", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ value: 42 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await cachedFetch(
      "https://example.com/a",
      (d) => d as { value: number }
    );

    expect(result).toEqual({ value: 42 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("serves subsequent calls from the in-memory cache without refetching", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ value: 1 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await cachedFetch("https://example.com/b", (d) => d);
    await cachedFetch("https://example.com/b", (d) => d);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })
    );

    await expect(
      cachedFetch("https://example.com/missing", (d) => d)
    ).rejects.toThrow(/404/u);
  });

  it("does not cache different URLs together", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: 2 }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const a = await cachedFetch(
      "https://example.com/c",
      (d) => d as { value: number }
    );
    const b = await cachedFetch(
      "https://example.com/d",
      (d) => d as { value: number }
    );

    expect(a.value).toBe(1);
    expect(b.value).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
