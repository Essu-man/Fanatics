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
        <section className="relative w-full overflow-hidden">
            <div className="relative h-[350px] w-full sm:h-[400px] md:h-[500px] lg:h-[550px] flex flex-col md:flex-row">
                {/* Background Image - Mobile */}
                <div className="absolute inset-0 md:hidden">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
                            style={{ backgroundImage: `url('${slide.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                    ))}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                {/* Left Side - Content */}
                <div className="relative md:relative w-full md:w-1/2 bg-amber-50 flex items-center justify-center md:justify-start px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 md:py-0 z-10 md:z-auto">
                    <div className="max-w-md space-y-4 sm:space-y-6 text-center md:text-left">
                        <div className="inline-block rounded-full bg-white/20 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-zinc-900 backdrop-blur-sm">
                            Limited Time Offer
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-zinc-900 mb-2 sm:mb-3">
                            25% Off All<br />
                            <span className="text-orange-600">
                                Football and Basketball
                            </span>
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-zinc-700 max-w-xl mx-auto md:mx-0">
                            Shop the latest styles and support your favorite team with our exclusive collection. Authentic gear for true fans.
                        </p>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 justify-center md:justify-start">
                            <Button
                                as={Link}
                                href="/shop"
                                className="bg-zinc-900 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold hover:bg-zinc-800 transition-colors"
                            >
                                Shop Now
                            </Button>
                            <Button
                                as={Link}
                                href="/teams"
                                className="border-2 border-zinc-900 text-zinc-900 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold bg-transparent hover:bg-zinc-900 hover:text-white transition-all"
                            >
                                Browse Teams
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Image Carousel - Desktop Only */}
                <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
                            style={{ backgroundImage: `url('${slide.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

