import { z } from "zod";

export const namedApiResourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});
export type NamedApiResource = z.infer<typeof namedApiResourceSchema>;

export const namedApiResourceListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(namedApiResourceSchema),
});
export type NamedApiResourceList = z.infer<typeof namedApiResourceListSchema>;

const versionSpritesSchema = z.record(z.string(), z.unknown());

export const pokemonSpritesSchema = z.object({
  back_default: z.string().nullable(),
  back_shiny: z.string().nullable(),
  front_default: z.string().nullable(),
  front_shiny: z.string().nullable(),
  other: z
    .object({
      "official-artwork": z
        .object({
          front_default: z.string().nullable(),
          front_shiny: z.string().nullable().optional(),
        })
        .optional(),
      home: z
        .object({
          front_default: z.string().nullable(),
          front_shiny: z.string().nullable().optional(),
        })
        .optional(),
      showdown: z
        .object({
          front_default: z.string().nullable().optional(),
          back_default: z.string().nullable().optional(),
          front_shiny: z.string().nullable().optional(),
          back_shiny: z.string().nullable().optional(),
        })
        .optional(),
    })
    .optional(),
  versions: versionSpritesSchema.optional(),
});
export type PokemonSprites = z.infer<typeof pokemonSpritesSchema>;

export const pokemonCriesSchema = z.object({
  latest: z.string().nullable(),
  legacy: z.string().nullable(),
});

export const pokemonTypeSlotSchema = z.object({
  slot: z.number(),
  type: namedApiResourceSchema,
});

export const pokemonAbilitySlotSchema = z.object({
  ability: namedApiResourceSchema,
  is_hidden: z.boolean(),
  slot: z.number(),
});

export const pokemonStatSlotSchema = z.object({
  base_stat: z.number(),
  effort: z.number(),
  stat: namedApiResourceSchema,
});

export const pokemonMoveSchema = z.object({
  move: namedApiResourceSchema,
});

export const pokemonSchema = z.object({
  abilities: z.array(pokemonAbilitySlotSchema),
  base_experience: z.number().nullable(),
  cries: pokemonCriesSchema.optional(),
  height: z.number(),
  id: z.number(),
  moves: z.array(pokemonMoveSchema),
  name: z.string(),
  species: namedApiResourceSchema,
  sprites: pokemonSpritesSchema,
  stats: z.array(pokemonStatSlotSchema),
  types: z.array(pokemonTypeSlotSchema),
  weight: z.number(),
});
export type Pokemon = z.infer<typeof pokemonSchema>;

export const evolutionDetailSchema = z.object({
  item: namedApiResourceSchema.nullable(),
  min_level: z.number().nullable(),
  trigger: namedApiResourceSchema.nullable(),
});

export interface EvolutionChainLink {
  species: NamedApiResource;
  evolution_details: z.infer<typeof evolutionDetailSchema>[];
  evolves_to: EvolutionChainLink[];
}

export const evolutionChainLinkSchema: z.ZodType<EvolutionChainLink> = z.lazy(
  () =>
    z.object({
      evolution_details: z.array(evolutionDetailSchema),
      evolves_to: z.array(evolutionChainLinkSchema),
      species: namedApiResourceSchema,
    })
);

export const evolutionChainSchema = z.object({
  chain: evolutionChainLinkSchema,
  id: z.number(),
});
export type EvolutionChain = z.infer<typeof evolutionChainSchema>;

export const pokemonSpeciesSchema = z.object({
  evolution_chain: z.object({ url: z.string() }),
  flavor_text_entries: z.array(
    z.object({
      flavor_text: z.string(),
      language: namedApiResourceSchema,
      version: namedApiResourceSchema,
    })
  ),
  genera: z.array(
    z.object({
      genus: z.string(),
      language: namedApiResourceSchema,
    })
  ),
  id: z.number(),
  is_legendary: z.boolean(),
  is_mythical: z.boolean(),
  name: z.string(),
});
export type PokemonSpecies = z.infer<typeof pokemonSpeciesSchema>;

export const typeDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon: z.array(
    z.object({
      pokemon: namedApiResourceSchema,
      slot: z.number(),
    })
  ),
});
export type TypeDetail = z.infer<typeof typeDetailSchema>;

export const generationDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon_species: z.array(namedApiResourceSchema),
});
export type GenerationDetail = z.infer<typeof generationDetailSchema>;

export const berryFlavorMapSchema = z.object({
  flavor: namedApiResourceSchema,
  potency: z.number(),
});

export const berrySchema = z.object({
  firmness: namedApiResourceSchema,
  flavors: z.array(berryFlavorMapSchema),
  growth_time: z.number(),
  id: z.number(),
  item: namedApiResourceSchema,
  max_harvest: z.number(),
  name: z.string(),
  natural_gift_power: z.number(),
  natural_gift_type: namedApiResourceSchema,
  size: z.number(),
  smoothness: z.number(),
  soil_dryness: z.number(),
});
export type Berry = z.infer<typeof berrySchema>;
