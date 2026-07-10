import type { EvolutionChainLink } from "$lib/api/schemas";

export const TYPE_COLORS: Record<string, string> = {
  bug: "#A6B91A",
  dark: "#705746",
  dragon: "#6F35FC",
  electric: "#F7D02C",
  fairy: "#D685AD",
  fighting: "#C22E28",
  fire: "#EE8130",
  flying: "#A98FF3",
  ghost: "#735797",
  grass: "#7AC74C",
  ground: "#E2BF65",
  ice: "#96D9D6",
  normal: "#A8A77A",
  poison: "#A33EA1",
  psychic: "#F95587",
  rock: "#B6A136",
  steel: "#B7B7CE",
  water: "#6390F0",
};

export const ALL_TYPES = Object.keys(TYPE_COLORS);

export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? "#68A090";
}

export const STAT_LABELS: Record<string, string> = {
  attack: "Attack",
  defense: "Defense",
  hp: "HP",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

export const STAT_MAX = 255;

export function formatName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export interface EvolutionStep {
  name: string;
  id: number;
  minLevel: number | null;
  trigger: string | null;
  item: string | null;
}

function idFromResourceUrl(url: string): number {
  const match = url.match(/\/(?<id>\d+)\/?$/u);
  return match ? Number(match.groups?.id) : 0;
}

export function flattenEvolutionChain(
  link: EvolutionChainLink
): EvolutionStep[][] {
  const stages: EvolutionStep[][] = [];

  function visit(node: EvolutionChainLink, depth: number) {
    if (!stages[depth]) {
      stages[depth] = [];
    }
    const [detail] = node.evolution_details;
    stages[depth].push({
      id: idFromResourceUrl(node.species.url),
      item: detail?.item?.name ?? null,
      minLevel: detail?.min_level ?? null,
      name: node.species.name,
      trigger: detail?.trigger?.name ?? null,
    });
    for (const next of node.evolves_to) {
      visit(next, depth + 1);
    }
  }

  visit(link, 0);
  return stages;
}
