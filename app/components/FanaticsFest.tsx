"use client";

import Button from "./ui/button";

export default function FanaticsFest() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
          <div className="relative aspect-[16/7] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&h=840&fit=crop"
              alt="Fanatics Fest NYC"
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
              <h2 className="mb-2 text-3xl font-black md:text-4xl lg:text-5xl">
                FANATICS FEST NYC
              </h2>
              <p className="mb-1 text-xl font-bold md:text-2xl">JULY 16-19</p>
              <p className="mb-1 text-lg font-semibold md:text-xl">JAVITS CENTER</p>
              <p className="mb-6 text-base text-white/90 md:text-lg">
                THE WORLD&apos;S #1 SPORTS FAN FESTIVAL
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  as="a"
                  href="#"
                  className="bg-[var(--brand-red)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--brand-red-dark)]"
                >
                  TICKETS ON SALE NOW
                </Button>
                <Button
                  as="a"
                  href="#"
                  className="border-2 border-white bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/20"
                >
                  BUY NOW
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

