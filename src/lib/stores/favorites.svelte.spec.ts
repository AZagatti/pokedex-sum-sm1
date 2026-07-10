import { describe, expect, it, beforeEach } from "vitest";

import { favoritesStore } from "./favorites.svelte";

describe("favoritesStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty before init", () => {
    expect(favoritesStore.has("pikachu")).toBe(false);
  });

  it("toggle adds and removes a name", () => {
    favoritesStore.toggle("pikachu");
    expect(favoritesStore.has("pikachu")).toBe(true);
    expect(favoritesStore.value).toContain("pikachu");

    favoritesStore.toggle("pikachu");
    expect(favoritesStore.has("pikachu")).toBe(false);
    expect(favoritesStore.value).not.toContain("pikachu");
  });

  it("persists favorites to localStorage", () => {
    favoritesStore.toggle("bulbasaur");
    const raw = localStorage.getItem("pokedex-favorites");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? "[]")).toContain("bulbasaur");
  });

  it("supports multiple favorites independently", () => {
    favoritesStore.toggle("charmander");
    favoritesStore.toggle("squirtle");
    expect(favoritesStore.has("charmander")).toBe(true);
    expect(favoritesStore.has("squirtle")).toBe(true);

    favoritesStore.toggle("charmander");
    expect(favoritesStore.has("charmander")).toBe(false);
    expect(favoritesStore.has("squirtle")).toBe(true);
  });
});
