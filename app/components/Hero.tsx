"use client";

import Button from "./ui/button";
import { useEffect, useState } from "react";

const backgroundImages = [
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1516138889897-3a135b1e0d40?w=1920&h=1080&fit=crop",
];

export default function Hero() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative overflow-hidden rounded-2xl bg-zinc-900 px-6 py-20 text-white">
            {/* Video Background */}
            <div className="absolute inset-0 overflow-hidden">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute h-full w-full object-cover opacity-20"
                >
                    <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02f&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
                </video>
                {/* Cycling Background Images */}
                {backgroundImages.map((image, index) => (
                    <div
                        key={image}
                        className="absolute inset-0 transition-opacity duration-1000"
                        style={{
                            opacity: index === currentImageIndex ? 0.4 : 0,
                            zIndex: index === currentImageIndex ? 1 : 0,
                        }}
                    >
                        <img
                            src={image}
                            alt="Football atmosphere"
                            className="h-full w-full object-cover"
                        />
                    </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-indigo-950/80 to-indigo-950/60 backdrop-blur-sm"></div>
            </div>

            {/* Content */}
            <div className="relative mx-auto max-w-4xl">
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Cediman — Football jerseys reinvented
                </h1>
                <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-white/90">
                    Curated authentic jerseys, retro classics, and limited drops — designed for fans who demand more than just a logo.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                    <Button as="a" href="#"
                        className="!bg-white !text-indigo-900 hover:!bg-indigo-50 px-8 py-3 text-sm font-bold shadow-lg shadow-indigo-950/20">
                        Shop jerseys
                    </Button>
                    <Button as="a" href="#" variant="ghost"
                        className="!border-2 !border-white/30 !bg-white/5 !text-white px-8 py-3 text-sm font-bold backdrop-blur hover:!border-white/50 hover:!bg-white/10">
                        Limited drops
                    </Button>
                </div>
            </div>
        </section>
    );
}