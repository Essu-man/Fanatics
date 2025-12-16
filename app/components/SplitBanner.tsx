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
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[400px] w-full md:h-[500px] lg:h-[550px] flex">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>

        {/* Animated soccer ball pattern background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        {/* Left Section */}
        <div className="hidden md:flex md:w-1/2 group relative overflow-hidden">
          <div className="transition-transform duration-300 group-hover:scale-105 h-full w-full">
            <MediaComponent media={{ ...leftSection, title: leftSection.title }} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 text-white">
            <h3 className="mb-6 text-3xl font-bold md:text-4xl leading-tight">{leftSection.title}</h3>
            <div className="flex flex-wrap gap-3">
              {leftSection.buttons.map((button, index) => (
                <Button
                  key={index}
                  as="a"
                  href={button.href}
                  className="bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 group relative overflow-hidden">
          <div className="transition-transform duration-300 group-hover:scale-105 h-full w-full">
            <MediaComponent media={{ ...rightSection, title: rightSection.title }} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 text-white">
            <h3 className="mb-6 text-3xl font-bold md:text-4xl leading-tight">{rightSection.title}</h3>
            <div className="flex flex-wrap gap-3">
              {rightSection.buttons.map((button, index) => (
                <Button
                  key={index}
                  as="a"
                  href={button.href}
                  className="bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
