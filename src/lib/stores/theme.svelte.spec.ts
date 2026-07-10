import { describe, expect, it, beforeEach } from "vitest";

import { themeStore } from "./theme.svelte";

describe("themeStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to light before init", () => {
    expect(themeStore.value).toBe("light");
  });

  it("toggle flips between light and dark", () => {
    themeStore.set("light");
    themeStore.toggle();
    expect(themeStore.value).toBe("dark");
    themeStore.toggle();
    expect(themeStore.value).toBe("light");
  });

  it("set persists the theme to localStorage", () => {
    themeStore.set("dark");
    expect(localStorage.getItem("pokedex-theme")).toBe("dark");
  });
});
