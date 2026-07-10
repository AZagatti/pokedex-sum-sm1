import { describe, expect, it } from "vitest";

import {
  berrySchema,
  evolutionChainSchema,
  namedApiResourceListSchema,
  pokemonSchema,
} from "./schemas";

describe("namedApiResourceListSchema", () => {
  it("parses a valid list response", () => {
    const data = {
      count: 1302,
      next: "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
      previous: null,
      results: [
        { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
      ],
    };
    expect(() => namedApiResourceListSchema.parse(data)).not.toThrow();
  });
});

describe("pokemonSchema", () => {
  const basePokemon = {
    id: 25,
    name: "pikachu",
    height: 4,
    weight: 60,
    base_experience: 112,
    sprites: {
      front_default: "https://example.com/25.png",
      front_shiny: "https://example.com/25-shiny.png",
      back_default: null,
      back_shiny: null,
    },
    types: [{ slot: 1, type: { name: "electric", url: "" } }],
    abilities: [
      { ability: { name: "static", url: "" }, is_hidden: false, slot: 1 },
    ],
    stats: [{ base_stat: 35, effort: 0, stat: { name: "hp", url: "" } }],
    moves: [{ move: { name: "thunder-shock", url: "" } }],
    species: {
      name: "pikachu",
      url: "https://pokeapi.co/api/v2/pokemon-species/25/",
    },
  };

  it("parses a full pokemon payload", () => {
    expect(() => pokemonSchema.parse(basePokemon)).not.toThrow();
  });

  it("accepts a null cries.legacy field (PokeAPI returns null for some entries)", () => {
    const withCries = {
      ...basePokemon,
      cries: { latest: "https://example.com/25.ogg", legacy: null },
    };
    const parsed = pokemonSchema.parse(withCries);
    expect(parsed.cries?.legacy).toBeNull();
  });

  it("rejects a payload missing required fields", () => {
    const { id: _id, ...missingId } = basePokemon;
    expect(() => pokemonSchema.parse(missingId)).toThrow();
  });
});

describe("evolutionChainSchema", () => {
  it("parses a recursive evolution chain", () => {
    const data = {
      id: 10,
      chain: {
        species: { name: "pichu", url: "" },
        evolution_details: [],
        evolves_to: [
          {
            species: { name: "pikachu", url: "" },
            evolution_details: [
              {
                min_level: 220,
                trigger: { name: "level-up", url: "" },
                item: null,
              },
            ],
            evolves_to: [],
          },
        ],
      },
    };
    const parsed = evolutionChainSchema.parse(data);
    expect(parsed.chain.evolves_to[0].species.name).toBe("pikachu");
  });
});

describe("berrySchema", () => {
  it("parses a valid berry payload", () => {
    const data = {
      id: 1,
      name: "cheri",
      growth_time: 3,
      max_harvest: 5,
      natural_gift_power: 60,
      size: 20,
      smoothness: 25,
      soil_dryness: 15,
      firmness: { name: "soft", url: "" },
      flavors: [{ potency: 10, flavor: { name: "spicy", url: "" } }],
      item: { name: "cheri-berry", url: "" },
      natural_gift_type: { name: "fire", url: "" },
    };
    expect(() => berrySchema.parse(data)).not.toThrow();
  });
});
