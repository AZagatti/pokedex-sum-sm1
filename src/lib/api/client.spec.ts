import { describe, expect, it } from "vitest";

import { idFromUrl } from "./client";

describe("idFromUrl", () => {
  it("extracts the trailing numeric id from a PokeAPI resource URL", () => {
    expect(idFromUrl("https://pokeapi.co/api/v2/pokemon/25/")).toBe(25);
  });

  it("handles URLs without a trailing slash", () => {
    expect(idFromUrl("https://pokeapi.co/api/v2/pokemon-species/172")).toBe(
      172
    );
  });

  it("returns NaN for a URL with no numeric segment", () => {
    expect(idFromUrl("https://pokeapi.co/api/v2/pokemon/")).toBeNaN();
  });
});
