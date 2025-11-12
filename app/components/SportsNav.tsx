"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FootballDropdown, BasketballDropdown } from "./SportsNavDropdown";

export default function SportsNav() {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    return (
        <nav className="border-b border-zinc-200 bg-white relative z-40">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex items-center justify-center gap-8 py-3">
                    <div
                        className="group relative"
                        onMouseEnter={() => setActiveDropdown("football")}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <Link
                            href="#"
                            className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-bold transition-colors ${
                                activeDropdown === "football"
                                    ? "bg-[var(--brand-red)] text-white"
                                    : "text-zinc-900 hover:text-[var(--brand-red)]"
                            }`}
                            aria-label="Football teams"
                            aria-expanded={activeDropdown === "football"}
                        >
                            <Image
                                src="https://cdn-icons-png.flaticon.com/512/1051/1051328.png"
                                alt="Football"
                                width={20}
                                height={20}
                                className="object-contain"
                            />
                            FOOTBALL
                        </Link>
                        {activeDropdown === "football" && (
                            <div onMouseEnter={() => setActiveDropdown("football")} onMouseLeave={() => setActiveDropdown(null)}>
                                <FootballDropdown />
                            </div>
                        )}
                    </div>

                    <div
                        className="group relative"
                        onMouseEnter={() => setActiveDropdown("basketball")}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <Link
                            href="#"
                            className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-bold transition-colors ${
                                activeDropdown === "basketball"
                                    ? "bg-[var(--brand-red)] text-white"
                                    : "text-zinc-900 hover:text-[var(--brand-red)]"
                            }`}
                            aria-label="Basketball teams"
                            aria-expanded={activeDropdown === "basketball"}
                        >
                            <Image
                                src="https://cdn-icons-png.flaticon.com/512/1051/1051330.png"
                                alt="Basketball"
                                width={20}
                                height={20}
                                className="object-contain"
                            />
                            BASKETBALL
                        </Link>
                        {activeDropdown === "basketball" && (
                            <div onMouseEnter={() => setActiveDropdown("basketball")} onMouseLeave={() => setActiveDropdown(null)}>
                                <BasketballDropdown />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

