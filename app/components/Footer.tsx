"use client";

import Link from "next/link";
import Button from "./ui/button";
import { useState } from "react";

export default function Footer() {
    const [email, setEmail] = useState("");

    return (
        <footer className="mt-16 border-t border-zinc-200 bg-zinc-50 py-12">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 mb-8">
                    {/* Cediman Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl font-black text-[var(--brand-red)]">X</span>
                            <span className="text-xl font-extrabold text-zinc-900">Cediman</span>
                        </div>
                        <p className="text-sm text-zinc-700">
                            Your official source for football and basketball jerseys.
                        </p>
                    </div>

                    {/* Shop Column */}
                    <div>
                        <h3 className="font-semibold text-zinc-900 mb-4">Shop</h3>
                        <ul className="space-y-2 text-sm text-zinc-700">
                            <li>
                                <Link href="#" className="hover:text-[var(--brand-red)]">Football</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-[var(--brand-red)]">Basketball</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-[var(--brand-red)]">New Arrivals</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-[var(--brand-red)]">Sale</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service Column */}
                    <div>
                        <h3 className="font-semibold text-zinc-900 mb-4">Customer Service</h3>
                        <ul className="space-y-2 text-sm text-zinc-700">
                            <li>
                                <Link href="#" className="hover:text-[var(--brand-red)]">Contact Us</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-[var(--brand-red)]">FAQ</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-[var(--brand-red)]">Shipping & Returns</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-[var(--brand-red)]">Track Order</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="font-semibold text-zinc-900 mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-zinc-700">
                            <li>
                                <Link href="#" className="hover:text-[var(--brand-red)]">About Us</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-[var(--brand-red)]">Careers</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-[var(--brand-red)]">Privacy Policy</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div>
                        <h3 className="font-semibold text-zinc-900 mb-4">Newsletter</h3>
                        <p className="text-sm text-zinc-700 mb-4">
                            Sign up for special offers and new arrivals.
                        </p>
                        <form onSubmit={(e) => { e.preventDefault(); setEmail(""); }} className="flex flex-col gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                className="h-10 w-full rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]"
                            />
                            <Button type="submit" className="bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)] px-4 py-2 text-sm font-medium">
                                Subscribe
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-200 text-center text-xs text-zinc-500">
                    © 2024 Cediman. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
