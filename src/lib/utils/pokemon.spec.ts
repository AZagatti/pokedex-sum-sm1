import type { EvolutionChainLink } from "$lib/api/schemas";
import { describe, expect, it } from "vitest";

import {
  formatName,
  typeColor,
  flattenEvolutionChain,
  STAT_MAX,
  ALL_TYPES,
} from "./pokemon";

describe("formatName", () => {
  it("capitalizes single words", () => {
    expect(formatName("pikachu")).toBe("Pikachu");
  });

  it("capitalizes each hyphen-separated part", () => {
    expect(formatName("nidoran-f")).toBe("Nidoran F");
    expect(formatName("deoxys-attack")).toBe("Deoxys Attack");
  });
});

describe("typeColor", () => {
  it("returns a known color for a valid type", () => {
    expect(typeColor("fire")).toBe("#EE8130");
  });

  it("falls back to a default color for unknown types", () => {
    expect(typeColor("not-a-type")).toBe("#68A090");
  });

  it("has a color for every documented type", () => {
    for (const type of ALL_TYPES) {
      expect(typeColor(type)).toMatch(/^#[0-9A-Fa-f]{6}$/u);
    }
  });
});

describe("STAT_MAX", () => {
  it("is the PokeAPI base-stat ceiling", () => {
    expect(STAT_MAX).toBe(255);
  });
});

describe("flattenEvolutionChain", () => {
  it("flattens a linear chain into ordered stages", () => {
    const chain: EvolutionChainLink = {
      species: {
        name: "pichu",
        url: "https://pokeapi.co/api/v2/pokemon-species/172/",
      },
      evolution_details: [],
      evolves_to: [
        {
          species: {
            name: "pikachu",
            url: "https://pokeapi.co/api/v2/pokemon-species/25/",
          },
          evolution_details: [
            {
              min_level: 220,
              trigger: { name: "level-up", url: "" },
              item: null,
            },
          ],
          evolves_to: [
            {
              species: {
                name: "raichu",
                url: "https://pokeapi.co/api/v2/pokemon-species/26/",
              },
              evolution_details: [
                {
                  min_level: null,
                  trigger: { name: "use-item", url: "" },
                  item: { name: "thunder-stone", url: "" },
                },
              ],
              evolves_to: [],
            },
          ],
        },
      ],
    };

    const stages = flattenEvolutionChain(chain);

    expect(stages).toHaveLength(3);
    expect(stages[0][0].name).toBe("pichu");
    expect(stages[0][0].id).toBe(172);
    expect(stages[1][0].name).toBe("pikachu");
    expect(stages[1][0].minLevel).toBe(220);
    expect(stages[2][0].name).toBe("raichu");
    expect(stages[2][0].item).toBe("thunder-stone");
  });

  it("handles branching evolutions (multiple evolves_to at the same stage)", () => {
    const chain: EvolutionChainLink = {
      species: {
        name: "eevee",
        url: "https://pokeapi.co/api/v2/pokemon-species/133/",
      },
      evolution_details: [],
      evolves_to: [
        {
          species: {
            name: "vaporeon",
            url: "https://pokeapi.co/api/v2/pokemon-species/134/",
          },
          evolution_details: [],
          evolves_to: [],
        },
        {
          species: {
            name: "jolteon",
            url: "https://pokeapi.co/api/v2/pokemon-species/135/",
          },
          evolution_details: [],
          evolves_to: [],
        },
      ],
    };

    const stages = flattenEvolutionChain(chain);

    expect(stages).toHaveLength(2);
    expect(stages[1].map((s) => s.name)).toEqual(["vaporeon", "jolteon"]);
  });
});
