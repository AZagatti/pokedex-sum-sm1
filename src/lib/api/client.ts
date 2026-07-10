import { cachedFetch } from "./cache";
import {
  berrySchema,
  evolutionChainSchema,
  generationDetailSchema,
  namedApiResourceListSchema,
  pokemonSchema,
  pokemonSpeciesSchema,
  typeDetailSchema,
} from "./schemas";
import type {
  Berry,
  EvolutionChain,
  GenerationDetail,
  NamedApiResourceList,
  Pokemon,
  PokemonSpecies,
  TypeDetail,
} from "./schemas";

export const API_BASE = "https://pokeapi.co/api/v2";

export function getPokemonList(
  limit: number,
  offset: number
): Promise<NamedApiResourceList> {
  return cachedFetch(
    `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`,
    (data) => namedApiResourceListSchema.parse(data)
  );
}

export function getPokemon(nameOrId: string | number): Promise<Pokemon> {
  return cachedFetch(`${API_BASE}/pokemon/${nameOrId}`, (data) =>
    pokemonSchema.parse(data)
  );
}

export function getPokemonSpecies(
  nameOrId: string | number
): Promise<PokemonSpecies> {
  return cachedFetch(`${API_BASE}/pokemon-species/${nameOrId}`, (data) =>
    pokemonSpeciesSchema.parse(data)
  );
}

export function getEvolutionChain(url: string): Promise<EvolutionChain> {
  return cachedFetch(url, (data) => evolutionChainSchema.parse(data));
}

export function getGeneration(id: number): Promise<GenerationDetail> {
  return cachedFetch(`${API_BASE}/generation/${id}`, (data) =>
    generationDetailSchema.parse(data)
  );
}

export function getType(name: string): Promise<TypeDetail> {
  return cachedFetch(`${API_BASE}/type/${name}`, (data) =>
    typeDetailSchema.parse(data)
  );
}

export function getBerryList(
  limit: number,
  offset: number
): Promise<NamedApiResourceList> {
  return cachedFetch(
    `${API_BASE}/berry?limit=${limit}&offset=${offset}`,
    (data) => namedApiResourceListSchema.parse(data)
  );
}

export function getBerry(nameOrId: string | number): Promise<Berry> {
  return cachedFetch(`${API_BASE}/berry/${nameOrId}`, (data) =>
    berrySchema.parse(data)
  );
}

export function idFromUrl(url: string): number {
  const match = url.match(/\/(?<id>\d+)\/?$/u);
  return match ? Number(match.groups?.id) : Number.NaN;
}
