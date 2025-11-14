"use client";

import Button from "./ui/button";

export default function MilitaryWearBanner() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* College Nike Military Appreciation */}
          <div className="group relative overflow-hidden rounded-lg">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=450&fit=crop"
                alt="College Nike Military Appreciation"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                  College Nike Military Appreciation
                </h3>
                <Button
                  as="a"
                  href="#"
                  className="w-fit bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
                >
                  Shop Now
                </Button>
              </div>
            </div>
          </div>

          {/* WEAR By Erin Andrews */}
          <div className="group relative overflow-hidden rounded-lg">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=800&h=450&fit=crop"
                alt="WEAR By Erin Andrews"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                <h3 className="mb-4 text-2xl font-bold md:text-3xl">WEAR By Erin Andrews</h3>
                <Button
                  as="a"
                  href="#"
                  className="w-fit bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
                >
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

