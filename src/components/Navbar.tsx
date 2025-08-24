"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, User, Search } from "lucide-react";

const NAV_ITEMS = [
  { label: "Jerseys", slug: "jerseys" },
  { label: "Shoes", slug: "shoes" },
  { label: "Caps", slug: "caps" },
  { label: "Accessories", slug: "accessories" },
  { label: "Equipment", slug: "equipment" },
];

export default function Navbar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-extrabold text-emerald-600 tracking-tight">
            Cediman
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <Link key={item.slug} href={`/category/${item.slug}`} className="hover:text-emerald-600">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <form onSubmit={submit} className="hidden md:flex relative w-full max-w-md">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, teams, categories…"
            className="w-full rounded-full border px-4 pl-10 py-2 text-sm outline-none focus:ring-2"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 opacity-60" />
        </form>

        <div className="flex items-center gap-3">
          <Link href="/search" className="md:hidden rounded-full border p-2">
            <Search className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="rounded-full border p-2">
            <ShoppingCart className="h-5 w-5" />
          </Link>
          <button className="rounded-full border p-2">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* mobile quick cats */}
      <div className="md:hidden overflow-x-auto no-scrollbar border-t">
        <div className="flex gap-4 px-4 py-2 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link key={item.slug} href={`/category/${item.slug}`} className="whitespace-nowrap">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
