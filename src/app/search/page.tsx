import Image from "next/image";
import { searchUnsplash } from "@/lib/unsplash";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim() || "sports apparel";
  const results = await searchUnsplash(q, 12);

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Search</h1>
      <p className="text-gray-600 mb-6">Results for “{q}”</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((r) => (
          <div key={r.id} className="rounded-lg overflow-hidden border">
            <Image src={r.src} alt={r.alt} width={600} height={600} className="w-full h-44 object-cover" />
          </div>
        ))}
      </div>
    </main>
  );
}
