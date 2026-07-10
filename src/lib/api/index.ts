import { getGeneration, getPokemonList, getType, idFromUrl } from "./client";

export interface PokemonIndexEntry {
  name: string;
  id: number;
  url: string;
}

let masterIndexPromise: Promise<PokemonIndexEntry[]> | null = null;

export function getMasterPokemonIndex(): Promise<PokemonIndexEntry[]> {
  if (!masterIndexPromise) {
    masterIndexPromise = getPokemonList(100_000, 0).then((list) =>
      list.results.map((r) => ({
        id: idFromUrl(r.url),
        name: r.name,
        url: r.url,
      }))
    );
  }
  return masterIndexPromise;
}

const generationNameCache = new Map<number, Promise<Set<string>>>();

export function getGenerationNames(id: number): Promise<Set<string>> {
  let cached = generationNameCache.get(id);
  if (!cached) {
    cached = getGeneration(id).then(
      (gen) => new Set(gen.pokemon_species.map((s) => s.name))
    );
    generationNameCache.set(id, cached);
  }
  return cached;
}

const typeNameCache = new Map<string, Promise<Set<string>>>();

export function getTypeNames(name: string): Promise<Set<string>> {
  let cached = typeNameCache.get(name);
  if (!cached) {
    cached = getType(name).then(
      (t) => new Set(t.pokemon.map((p) => p.pokemon.name))
    );
    typeNameCache.set(name, cached);
  }
  return cached;
}
