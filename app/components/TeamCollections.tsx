"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface TeamCollection {
    id: string;
    name: string;
    image: string;
    link: string;
}

export default function TeamCollections() {
    const [collections, setCollections] = useState<TeamCollection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Set team collections data with actual jersey images
        const teamCollectionsData: TeamCollection[] = [
            {
                id: "real-madrid",
                name: "Real Madrid",
                image: "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/1.jpeg",
                link: "/teams/real-madrid",
            },
            {
                id: "barcelona",
                name: "Barcelona",
                image: "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/2.jpeg",
                link: "/teams/barcelona",
            },
            {
                id: "bayern",
                name: "Bayern Munich",
                image: "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/3.jpeg",
                link: "/teams/bayern",
            },
            {
                id: "psg",
                name: "Paris Saint Germain",
                image: "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/4.jpeg",
                link: "/teams/psg",
            },
        ];

        setCollections(teamCollectionsData);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <section className="py-12 md:py-16 bg-white px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="h-12 bg-zinc-200 rounded animate-pulse mb-8"></div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 md:py-12 bg-white px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Grid Layout - 2 columns on mobile, 4 on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {collections.map((collection) => (
                        <Link
                            key={collection.id}
                            href={collection.link}
                            className="group relative overflow-hidden rounded-lg md:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-square overflow-hidden bg-zinc-100">
                                <img
                                    src={collection.image}
                                    alt={collection.name}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                {/* Overlay with gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-100"></div>
                                
                                {/* White Team Name Card - positioned at bottom */}
                                <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 right-2 md:right-3 bg-white rounded-md px-2 md:px-3 py-1.5 md:py-2 shadow-md">
                                    <h3 className="text-xs md:text-sm font-bold text-zinc-900 leading-tight truncate">{collection.name}</h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}