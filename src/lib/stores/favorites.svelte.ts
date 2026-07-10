const FAVORITES_KEY = "pokedex-favorites";

function readFavorites(): string[] {
  if (typeof localStorage === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x) => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function createFavoritesStore() {
  let favorites = $state<string[]>([]);
  let initialized = false;

  return {
    has(name: string) {
      return favorites.includes(name);
    },
    init() {
      if (initialized) {
        return;
      }
      initialized = true;
      favorites = readFavorites();
    },
    toggle(name: string) {
      favorites = favorites.includes(name)
        ? favorites.filter((f) => f !== name)
        : [...favorites, name];
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    },
    get value() {
      return favorites;
    },
  };
}

export const favoritesStore = createFavoritesStore();
