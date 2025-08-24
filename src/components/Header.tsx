"use client";
import Link from "next/link";
import { Search, User, ShoppingCart } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* left: logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* simple glyph */}
          <div className="h-7 w-7 rounded-full bg-primary" />
          <span className="text-2xl font-bold text-primary tracking-tight">Cediman</span>
        </Link>

        {/* center: search */}
        <form action="/search" method="GET" className="hidden md:block w-full max-w-xl">
          <div className="relative">
            <input
              name="q"
              placeholder="What can we help you find?"
              className="w-full rounded-full border px-4 pl-11 py-2.5 text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </form>

        {/* right: icons */}
        <div className="flex items-center gap-4">
          <Link href="/account" aria-label="Account" className="p-2 rounded-full hover:bg-gray-100">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/cart" aria-label="Cart" className="p-2 rounded-full hover:bg-gray-100">
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* primary nav */}
      <nav className="w-full">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <ul className="flex items-center gap-10 py-3 text-lg">
            <li><Link className="hover:text-primary" href="/jerseys">Jerseys</Link></li>
            <li><Link className="hover:text-primary" href="/lingerie">Lingerie</Link></li>
            <li><Link className="hover:text-primary" href="/hats">Hats</Link></li>
            <li><Link className="hover:text-primary" href="/shoes">Shoes</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
