export type UImage = { id: string; src: string; alt: string };

const FALLBACKS: Record<string, string[]> = {
  hero: [
    // Football on a field
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1600&auto=format&fit=crop",
  ],
  jerseys: [
    "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?q=80&w=1200&auto=format&fit=crop",
  ],
  lingerie: [
    "https://images.unsplash.com/photo-1584288767588-9a65ef4e59e2?q=80&w=1200&auto=format&fit=crop",
  ],
  hats: [
    "https://images.unsplash.com/photo-1534215754734-18e55d13e346?q=80&w=1200&auto=format&fit=crop",
  ],
  shoes: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
  ],
};

export async function searchUnsplash(
  query: string,
  perPage = 1
): Promise<UImage[]> {
  const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!key) return (FALLBACKS[query] || FALLBACKS.hero).slice(0, perPage).map((src, i) => ({
    id: `${query}-${i}`,
    src, alt: query
  }));

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("content_filter", "high");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${key}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("unsplash not ok");
    const data = await res.json();
    const results = (data.results || []) as any[];
    if (!results.length) throw new Error("empty results");
    return results.map((p) => ({
      id: p.id,
      src: p.urls?.regular || p.urls?.full,
      alt: p.alt_description || query,
    }));
  } catch {
    return (FALLBACKS[query] || FALLBACKS.hero).slice(0, perPage).map((src, i) => ({
      id: `${query}-${i}`,
      src, alt: query
    }));
  }
}
