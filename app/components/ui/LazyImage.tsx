"use client";

import { useState } from "react";

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    placeholder?: string;
}

export default function LazyImage({ src, alt, className = "", placeholder, ...props }: LazyImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`relative ${className}`}>
            {!loaded && !error && (
                <div className="absolute inset-0 animate-pulse bg-zinc-200" />
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-zinc-400">
                    <span className="text-xs">Image unavailable</span>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
                onLoad={() => setLoaded(true)}
                onError={() => {
                    setError(true);
                    setLoaded(true);
                }}
                loading="lazy"
                {...props}
            />
        </div>
    );
}

