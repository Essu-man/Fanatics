"use client";

import Button from "./ui/button";

export default function ColdWeatherGifts() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-lg">
          <div className="relative aspect-[16/6] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1516138889897-3a135b1e0d40?w=1920&h=800&fit=crop"
              alt="Cold Weather Gifts"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
              <h2 className="mb-3 text-3xl font-bold md:text-4xl">
                Cold Weather Gifts
              </h2>
              <p className="mb-6 text-lg text-white/90 md:text-xl">
                Winter Wins Start with the right gear
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  as="a"
                  href="#"
                  className="bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
                >
                  Men&apos;s
                </Button>
                <Button
                  as="a"
                  href="#"
                  className="bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
                >
                  Women&apos;s
                </Button>
                <Button
                  as="a"
                  href="#"
                  className="bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
                >
                  Kids&apos;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

