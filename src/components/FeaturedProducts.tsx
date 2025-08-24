"use client";

import Image from "next/image";
import Link from "next/link";

type Product = { id: string; img: string; alt: string; price: number; slug: string };

export default function FeaturedProducts({ items }: { items: Product[] }) {
  return (
    <section className="pb-12 pt-4">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">Featured</h2>
          <Link href="/search" className="text-sm hover:text-emerald-600">
            Browse all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="group relative rounded-2xl border bg-white shadow-sm overflow-hidden">
              <Link href={`/category/${p.slug}`} aria-label={p.alt}>
                <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={p.img}
                    alt={p.alt}
                    width={600}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 flex items-center justify-between text-sm">
                  <div className="line-clamp-1 font-medium">{p.alt}</div>
                  <div className="font-semibold">${p.price.toFixed(2)}</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
