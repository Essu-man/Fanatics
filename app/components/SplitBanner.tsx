"use client";

import Button from "./ui/button";

interface SplitBannerProps {
  leftSection: {
    title: string;
    image?: string;
    video?: string;
    buttons: { label: string; href: string }[];
  };
  rightSection: {
    title: string;
    image?: string;
    video?: string;
    buttons: { label: string; href: string }[];
  };
}

export default function SplitBanner({ leftSection, rightSection }: SplitBannerProps) {
  const MediaComponent = ({ media }: { media: { image?: string; video?: string; title: string } }) => {
    if (media.video) {
      return (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        >
          <source src={media.video} type="video/mp4" />
        </video>
      );
    }
    return (
      <img
        src={media.image}
        alt={media.title}
        className="h-full w-full object-cover"
      />
    );
  };

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Section */}
          <div className="group relative overflow-hidden rounded-lg">
            <div className="relative aspect-[16/9] overflow-hidden">
              <div className="transition-transform duration-300 group-hover:scale-105 h-full w-full">
                <MediaComponent media={{ ...leftSection, title: leftSection.title }} />
              </div>
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

          {/* Right Section */}
          <div className="group relative overflow-hidden rounded-lg">
            <div className="relative aspect-[16/9] overflow-hidden">
              <div className="transition-transform duration-300 group-hover:scale-105 h-full w-full">
                <MediaComponent media={{ ...rightSection, title: rightSection.title }} />
              </div>
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
