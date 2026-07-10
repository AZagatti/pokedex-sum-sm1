const store = new Map<string, unknown>();

export async function cachedFetch<T>(
  url: string,
  parse: (data: unknown) => T
): Promise<T> {
  const cached = store.get(url);
  if (cached !== undefined) {
    return cached as T;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${url}`);
  }

  const json = await res.json();
  const parsed = parse(json);
  store.set(url, parsed);
  return parsed;
}

export function clearCache(): void {
  store.clear();
}
