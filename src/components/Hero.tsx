import Image from "next/image";
import Link from "next/link";
import { searchUnsplash } from "@/lib/unsplash";

export default async function Hero() {
  const [hero] = await searchUnsplash("hero");

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 mt-4">
      <div className="relative w-full h-[360px] md:h-[420px] overflow-hidden rounded-md">
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            The Return<br/>Of Gameday
          </h2>
          <p className="mt-2 opacity-90">College Football</p>
          <Link
            href="/jerseys"
            className="mt-5 inline-block rounded-full bg-white text-gray-900 px-5 py-2.5 font-semibold hover:bg-gray-100"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
