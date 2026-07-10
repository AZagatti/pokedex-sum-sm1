# Architecture

## Overview

This is a single-page application built with SvelteKit's static adapter. There is no backend of our own — every screen is driven by client-side `fetch` calls straight to [PokéAPI](https://pokeapi.co/api/v2), validated with Zod before the app ever touches the response shape.

## Route structure

```
/                         prerendered shell; hydrates into the interactive list
/pokemon/[name]           client-rendered (ssr=false, prerender=false)
/berries                  prerendered shell
/berries/[name]           client-rendered (ssr=false, prerender=false)
/favorites                client-rendered (ssr=false, prerender=false)
```

Two rendering modes are mixed deliberately:

- **`/` and `/berries`** are prerendered at build time so the first paint on GitHub Pages is real HTML, not a blank shell — good for perceived performance and for crawlers/Lighthouse's first-contentful-paint checks. They still fetch their data client-side after hydration (the prerendered HTML is effectively a loading skeleton with the header/layout already painted).
- **Dynamic routes** (`/pokemon/[name]`, `/berries/[name]`, `/favorites`) can't be enumerated at build time (1,300+ Pokémon, arbitrary favorite sets) and are fully client-rendered. On GitHub Pages, any direct hit to one of these URLs is served through `adapter-static`'s SPA fallback (`404.html`), which loads the app shell and lets the client-side router take over.

## Data flow

1. A route's `+page.ts` `load()` function (or, for the list page, an `onMount`) calls a function in `src/lib/api/client.ts` — e.g. `getPokemon('pikachu')`.
2. That function calls `cachedFetch(url, parseFn)` from `src/lib/api/cache.ts`.
3. `cachedFetch` checks an in-memory `Map<string, unknown>` keyed by the full request URL. On a hit, it returns the cached (already-parsed) value synchronously-as-a-promise. On a miss, it calls `fetch`, awaits `.json()`, runs the result through the caller's Zod schema (`parseFn`), caches the _parsed_ result, and returns it.
4. If the response is malformed relative to the schema, `.parse()` throws — callers that fan out over many Pokémon (search index, stats sort) wrap each fetch in try/catch so one bad response doesn't stall the whole batch.

This means every consumer in the app works with fully-typed, runtime-validated data — components never see a raw `unknown` API response.

## Caching

The cache in `src/lib/api/cache.ts` is intentionally simple: a single module-level `Map`, no TTL, no eviction, cleared only on a full page reload. PokéAPI data doesn't change during a session, so staleness isn't a concern, and the trade-off (unbounded memory growth if a user browses hundreds of Pokémon in one sitting) was judged acceptable for a Pokédex-sized dataset. See [`DECISIONS.md`](DECISIONS.md) for the reasoning against a data-fetching library.

## The list page's filter/search/sort pipeline

`src/routes/+page.svelte` is the most involved piece of client logic in the app:

1. On mount, it fetches the **master index** — every Pokémon name + id, via one `limit=100000` request to `/pokemon` — once, and keeps it in memory (`getMasterPokemonIndex` in `src/lib/api/index.ts`, itself memoized so repeated calls across the session return the same promise).
2. **Search** filters that index by substring/exact-id match, debounced 250ms via a `$state` + `setTimeout` effect so the derived filter doesn't re-run on every keystroke.
3. **Generation/type filters** resolve each selected id/name to a `Set<string>` of Pokémon names (`getGenerationNames` / `getTypeNames`, both memoized), then intersect (types — a Pokémon must match every selected type) or union (generations — a Pokémon must be in _any_ selected generation) against the index. A monotonic request token guards against a slow-resolving fetch from an earlier filter selection overwriting state computed for a newer one.
4. **Sort by dex number** is free — the master index is already ordered. **Sort by base-stat total** requires the full `Pokemon` detail (stats aren't in the list endpoint), so it fetches every currently-filtered Pokémon with bounded concurrency (`mapWithConcurrency`, 24 in flight), shows live X/Y progress, and is guarded by the same request-token pattern as the filters.
5. **Infinite scroll** slices the final ordered name list to `visibleCount` (30 initially) and grows it via an `IntersectionObserver` on a sentinel element at the bottom of the grid. Visible-but-uncached Pokémon are fetched with bounded concurrency (8 in flight) and rendered as skeletons until they resolve.

## State persistence

Two `*.svelte.ts` modules hold cross-page state using Svelte 5 runes:

- **`theme.svelte.ts`** — `light` | `dark`, initialized from `localStorage` or `prefers-color-scheme`, persisted on every change, applied via a `.dark` class on `<html>` (a small inline script in `app.html` also applies it before hydration to avoid a flash of the wrong theme).
- **`favorites.svelte.ts`** — a flat array of Pokémon names, persisted to `localStorage` as JSON on every toggle.

Both guard every `localStorage` call with `typeof localStorage === 'undefined'` checks so the modules are safe to import from prerendered (server-evaluated) routes.

## Testing

- **Unit tests** (`*.spec.ts`, Vitest) cover the data layer (schema parsing, cache behavior, id extraction), pure utils (name formatting, evolution-chain flattening, bounded concurrency), and the two stores (in a `jsdom` environment, since they touch `localStorage`).
- **E2E tests** (`e2e/*.e2e.ts`, Playwright) drive the built-and-previewed app through the real user flows: search, filter, detail navigation, theme persistence across reload, favoriting + persistence, the berries flow, and the 404 page.
