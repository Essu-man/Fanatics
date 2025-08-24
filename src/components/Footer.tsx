export default function Footer() {
  return (
    <footer className="border-t py-8 text-sm text-gray-600">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
        <div>
          <div className="text-lg font-bold text-emerald-600">Cediman</div>
          <p className="mt-2 max-w-sm">
            A Fanatics-inspired shopping experience, tailored to your categories. Built for speed, clarity, and conversion.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="font-semibold text-gray-800">Shop</div>
            <a href="/category/jerseys" className="block hover:underline">Jerseys</a>
            <a href="/category/shoes" className="block hover:underline">Shoes</a>
            <a href="/category/caps" className="block hover:underline">Caps</a>
            <a href="/category/accessories" className="block hover:underline">Accessories</a>
            <a href="/category/equipment" className="block hover:underline">Equipment</a>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-gray-800">Support</div>
            <a href="/search" className="block hover:underline">Search</a>
            <a href="/cart" className="block hover:underline">Cart</a>
            <a href="#" className="block hover:underline">Shipping</a>
            <a href="#" className="block hover:underline">Returns</a>
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-semibold text-gray-800">Newsletter</div>
          <div className="flex max-w-sm gap-2">
            <input className="w-full rounded-xl border px-3 py-2 text-sm outline-none" placeholder="you@email.com" />
            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white">Join</button>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t pt-6 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Cediman. All rights reserved.
      </div>
    </footer>
  );
}
