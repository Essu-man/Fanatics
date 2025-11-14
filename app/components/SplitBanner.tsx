"use client";

import Button from "./ui/button";

interface SplitBannerProps {
  leftSection: {
    title: string;
    image: string;
    buttons: { label: string; href: string }[];
  };
  rightSection: {
    title: string;
    image: string;
    buttons: { label: string; href: string }[];
  };
}

export default function SplitBanner({ leftSection, rightSection }: SplitBannerProps) {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Section - Salute To Service */}
          <div className="group relative overflow-hidden rounded-lg">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={leftSection.image}
                alt={leftSection.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                <h3 className="mb-6 text-3xl font-bold md:text-4xl">{leftSection.title}</h3>
                <div className="flex flex-wrap gap-3">
                  {leftSection.buttons.map((button, index) => (
                    <Button
                      key={index}
                      as="a"
                      href={button.href}
                      className="bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
                    >
                      {button.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - NFL Rivalries */}
          <div className="group relative overflow-hidden rounded-lg">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={rightSection.image}
                alt={rightSection.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                <h3 className="mb-6 text-3xl font-bold md:text-4xl">{rightSection.title}</h3>
                <div className="flex flex-wrap gap-3">
                  {rightSection.buttons.map((button, index) => (
                    <Button
                      key={index}
                      as="a"
                      href={button.href}
                      className="bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
                    >
                      {button.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
