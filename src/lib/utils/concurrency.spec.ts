import { describe, expect, it } from "vitest";

import { mapWithConcurrency } from "./concurrency";

function delay(ms: number): Promise<void> {
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe("mapWithConcurrency", () => {
  it("maps every item and preserves order", async () => {
    const results = await mapWithConcurrency(
      [1, 2, 3, 4, 5],
      2,
      // eslint-disable-next-line require-await
      async (n) => n * 2
    );
    expect(results).toEqual([2, 4, 6, 8, 10]);
  });

  it("never runs more than `limit` tasks concurrently", async () => {
    let active = 0;
    let maxActive = 0;

    await mapWithConcurrency(
      Array.from({ length: 20 }, (_, i) => i),
      3,
      async (n) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await delay(1);
        active -= 1;
        return n;
      }
    );

    expect(maxActive).toBeLessThanOrEqual(3);
  });

  it("returns an empty array for an empty input", async () => {
    const results = await mapWithConcurrency(
      [],
      5,
      // eslint-disable-next-line require-await
      async (n: number) => n
    );
    expect(results).toEqual([]);
  });

  it("handles a limit larger than the item count", async () => {
    const results = await mapWithConcurrency(
      [1, 2],
      10,
      // eslint-disable-next-line require-await
      async (n) => n + 1
    );
    expect(results).toEqual([2, 3]);
  });
});
