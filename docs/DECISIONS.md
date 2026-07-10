# Decisions

Why each pinned choice from `SPEC.md`, plus the calls made within that spec.

## SvelteKit + Svelte 5 runes

Runes (`$state`, `$derived`, `$effect`) give explicit, fine-grained reactivity without the "what's reactive, what isn't" ambiguity of Svelte 4's implicit `$:` statements — useful in a page like `/` that juggles debounced search, async filter resolution, infinite scroll, and a second sort mode that fetches hundreds of records. Each piece of state has a clear owner and the dependency graph between derived values is legible from the code itself.

## `@sveltejs/adapter-static` in SPA mode

GitHub Pages only serves static files — no Node runtime. `adapter-static` with `fallback: '404.html'` produces a build where prerenderable routes get real HTML and everything else falls back to a client-rendered shell that GitHub Pages serves for any unmatched path (Pages treats a 404 response body as servable content, so `404.html` doubles as the SPA entry point). The alternative — prerendering _every_ route — isn't possible here: `/pokemon/[name]` has 1,300+ possible values and `/favorites` depends on client-only state.

## Tailwind CSS v4 + hand-written CSS for motion

Tailwind v4's CSS-first config (`@import "tailwindcss"`, `@custom-variant`) removes the JS config file entirely, which keeps the styling layer to two files (`layout.css` + inline utility classes). Utilities are still poor at expressing keyframe animations and `prefers-reduced-motion`-gated transitions cleanly, so those live in scoped `<style>` blocks per component (see the `pokemon-entrance` animation on the detail and berry-detail pages) rather than being forced into utility classes.

## Native `fetch` + a hand-rolled `Map` cache, no data-fetching library

The app's data-fetching needs are narrow: GET-only, no mutations, no background refetching, no request deduplication beyond "don't refetch a URL we already have." A library like TanStack Query solves problems this app doesn't have (cache invalidation, optimistic updates, retry/backoff policies) at the cost of a dependency and a mental model to learn. A ~20-line `cachedFetch` wrapping `fetch` + a `Map` covers everything actually needed, and keeps the data layer inspectable in one file (`src/lib/api/cache.ts`).

## Zod schemas for every consumed shape

PokéAPI's raw JSON is large, deeply nested, and not entirely uniform across endpoints (e.g. `cries.legacy` is `null` for a subset of Pokémon — this surfaced as a real bug during development, see `NOTES.md`). Parsing every response through a Zod schema means:

- TypeScript types are derived from the schema (`z.infer`), so the type and the runtime check can never drift apart.
- A malformed/unexpected response fails loudly and locally (a thrown `ZodError` at the fetch site) instead of surfacing as a confusing `undefined` three components downstream.

Schemas are intentionally _not_ 1:1 with PokéAPI's full response shape — each one only declares the fields the app actually reads, which keeps them readable and resilient to unrelated API fields changing.

## Svelte 5 runes + two stores instead of a state-management library

The app has exactly two pieces of state that need to outlive a single component and survive reload: theme and favorites. Both are simple enough (a string, a string array) that a full store library would be pure ceremony. Each is a factory function closing over `$state`, exposing a narrow getter/ setter API, wired to `localStorage` on write and read on init.

## Ultracite (oxlint + oxfmt) over ESLint + Prettier

Oxlint and oxfmt are Rust-based and dramatically faster than the JS-based ESLint/Prettier toolchain, which matters for lefthook running on every commit. Ultracite's `init` wired both tools with sane defaults in one command. The trade-off, documented in `oxlint.config.ts`, is that oxlint only analyzes the `<script>` block of `.svelte` files and doesn't understand Svelte 5's rune-based reactivity — its `prefer-const` autofix will happily convert a `let x = $state(...)` that's reassigned from a template event handler into an invalid `const`, since it can't see the template. A handful of rules (`prefer-const`, `func-style`, `sort-keys`, `filename-case`, and a couple of async/promise style rules that fight an intentional bounded-concurrency worker-pool pattern) are disabled project-wide for this reason — the alternative was fighting the linter's opinion on every future component.

## Lefthook over Husky

Lefthook is a single Go binary with no Node runtime overhead per hook invocation, YAML config, and built-in parallel job execution — meaningful when pre-commit runs oxlint + oxfmt + a full `svelte-check` typecheck on every commit. Pre-push runs the entire test suite (unit + e2e) so a broken build can't reach the remote.

## GitHub Actions: lint → check → test → build → deploy, gated on `main`

The pipeline mirrors the local pre-commit/pre-push checks so nothing that would fail locally can pass CI by accident. E2E tests run against the actual production build (`npm run build && npm run preview`) rather than the dev server, so a bug that only appears in the static-adapter output (as the initial `baseURL`/SPA-fallback issues during development did — see `NOTES.md`) is caught before merge. Deployment only runs on `main` after the full test suite passes, using `actions/upload-pages-artifact` + `actions/deploy-pages` per GitHub's current recommended flow (no third-party deploy action, minimal permissions: `pages: write` + `id-token: write` scoped to the deploy job only).
