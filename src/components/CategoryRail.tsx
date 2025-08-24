import Image from "next/image";
import Link from "next/link";
import { searchUnsplash } from "@/lib/unsplash";

const CATS: { slug: string; label: string; q: string }[] = [
  { slug: "jerseys",   label: "Jerseys",   q: "jerseys sports navy" },
  { slug: "lingerie",  label: "Lingerie",  q: "sports bra white minimal" },
  { slug: "hats",      label: "Hats",      q: "baseball cap navy" },
  { slug: "shoes",     label: "Shoes",     q: "running shoes navy minimalist" },
];

export default async function CategoryRail() {
  const imgs = await Promise.all(
    CATS.map(async (c) => {
      const [img] = await searchUnsplash(c.q);
      return { ...c, img };
    })
  );

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
      <h3 className="text-2xl md:text-3xl font-bold mb-5">Shop by Category</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {imgs.map((c) => (
          <Link
            key={c.slug}
            href={`/${c.slug}`}
            className="rounded-lg overflow-hidden border bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="relative h-40">
              <Image
                src={c.img.src}
                alt={c.img.alt}
                fill
                className="object-cover"
              />
            </div>
            <div className="bg-primary text-white text-center font-semibold py-2">
              {c.label}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
