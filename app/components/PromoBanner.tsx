"use client";

import Button from "./ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function PromoBanner() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/1.jpeg",
            label: "Jersey 1"
        },
        {
            image: "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/2.jpeg",
            label: "Jersey 2"
        },
        {
            image: "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/3.jpeg",
            label: "Jersey 3"
        },
        {
            image: "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/4.jpeg",
            label: "Jersey 4"
        },
        {
            image: "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/8.jpeg",
            label: "Jersey 5"
        },
        {
            image: "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/7.jpeg",
            label: "Jersey 6"
        },
        {
            image: "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/6.jpeg",
            label: "Jersey 7"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 2500); // Change every 2.5 seconds

        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <section className="relative w-full overflow-hidden bg-amber-50">
            <div className="relative w-full flex flex-col lg:flex-row">
                {/* Left Side - Content */}
                <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 lg:py-24 bg-amber-50">
                    <div className="w-full max-w-lg space-y-6 sm:space-y-8 text-center lg:text-left">
                        <div className="inline-block rounded-full bg-white/30 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-zinc-900 backdrop-blur-sm mx-auto lg:mx-0">
                            Limited Time Offer
                        </div>

                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-zinc-900 mb-2">
                                25% Off All
                            </h1>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-orange-600">
                                Football and Basketball
                            </h2>
                        </div>

                        <p className="text-sm sm:text-base md:text-lg text-zinc-700 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Shop the latest styles and support your favorite team with our exclusive collection. Authentic gear for true fans.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-4">
                            <Button
                                as={Link}
                                href="/shop"
                                className="w-full sm:w-auto bg-zinc-900 text-white px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold hover:bg-zinc-800 transition-colors rounded-lg"
                            >
                                Shop Now
                            </Button>
                            <Button
                                as={Link}
                                href="/teams"
                                className="w-full sm:w-auto border-2 border-zinc-900 text-zinc-900 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold bg-transparent hover:bg-zinc-900 hover:text-white transition-all rounded-lg"
                            >
                                Browse Teams
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Image Carousel (visible on all screens) */}
                <div className="w-full lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 h-72 sm:h-96 md:h-[500px] lg:h-screen flex items-center justify-center">
                    {/* Image Container */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 w-full h-full transition-opacity duration-700 flex items-center justify-center ${index === currentSlide ? "opacity-100" : "opacity-0"
                                    }`}
                            >
                                <img
                                    src={slide.image}
                                    alt={slide.label}
                                    className="w-full h-full object-contain md:object-cover lg:object-contain px-2 sm:px-4 md:px-6 lg:px-8"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Slide Indicators */}
                    <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`transition-all duration-300 rounded-full ${index === currentSlide
                                    ? "bg-orange-600 w-2.5 h-2.5 sm:w-3 sm:h-3"
                                    : "bg-white/40 w-2 h-2 hover:bg-white/60"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

