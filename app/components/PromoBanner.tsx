"use client";

import Button from "./ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function PromoBanner() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&h=1080&fit=crop",
            label: "Football Action"
        },
        {
            image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&h=1080&fit=crop",
            label: "Soccer Pitch"
        },
        {
            image: "https://images.unsplash.com/photo-1516977080064-fde7c36b15cb?w=1920&h=1080&fit=crop",
            label: "Basketball Court"
        },
        {
            image: "https://images.unsplash.com/photo-1488747807830-63789f68bb65?w=1920&h=1080&fit=crop",
            label: "Sports Players"
        },
        {
            image: "https://images.unsplash.com/photo-1574623452619-afcda10c7d5a?w=1920&h=1080&fit=crop",
            label: "Team Spirit"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 2500); // Change every 2.5 seconds

        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <section className="relative w-full overflow-hidden">
            <div className="relative h-[400px] w-full md:h-[500px] lg:h-[550px] flex">
                {/* Left Side - Content */}
                <div className="w-full md:w-1/2 bg-amber-50 flex items-center px-6 md:px-10 lg:px-16 py-8">
                    <div className="max-w-md space-y-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 leading-tight mb-3">
                                Up To 60% Off
                            </h1>
                            <p className="text-sm md:text-base text-zinc-600">
                                Passion The Season Strong, Just In Time.
                            </p>
                        </div>
                        <Button
                            as={Link}
                            href="/shop"
                            className="bg-zinc-900 text-white px-8 py-3 text-base font-semibold hover:bg-zinc-800 transition-colors w-fit"
                        >
                            Shop Now
                        </Button>
                    </div>
                </div>

                {/* Right Side - Image Carousel */}
                <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-700 ${index === currentSlide ? "opacity-100" : "opacity-0"
                                }`}
                            style={{ backgroundImage: `url('${slide.image}')` }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

