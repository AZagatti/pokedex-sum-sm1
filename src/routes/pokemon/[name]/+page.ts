import {
  getEvolutionChain,
  getPokemon,
  getPokemonSpecies,
} from "$lib/api/client";
import { error } from "@sveltejs/kit";

import type { PageLoad } from "./$types";

export const prerender = false;
export const ssr = false;

export const load: PageLoad = async ({ params }) => {
  try {
    const pokemon = await getPokemon(params.name);
    const species = await getPokemonSpecies(pokemon.species.name);
    const evolutionChain = await getEvolutionChain(species.evolution_chain.url);
    return { evolutionChain, pokemon, species };
  } catch {
    error(404, `Pokémon "${params.name}" could not be found.`);
  }
};
