"use client";

import Link from "next/link";
import Button from "./ui/button";
import { useState } from "react";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail("");
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <footer className="relative bg-white text-gray-900 overflow-hidden border-t border-gray-200">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10">
                {/* Top Section - Newsletter */}
                <div className="border-b border-gray-200 px-6 py-12 md:py-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Stay in the Game</h2>
                                <p className="text-gray-600 text-sm md:text-base">
                                    Get exclusive drops, team updates, and special offers delivered to your inbox.
                                </p>
                            </div>
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="flex-1 h-12 rounded-lg border border-gray-300 bg-gray-50 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                />
                                <Button
                                    type="submit"
                                    className="h-12 px-8 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap"
                                >
                                    Subscribe
                                </Button>
                            </form>
                            {subscribed && (
                                <p className="col-span-full text-green-600 text-sm font-medium">✓ Thanks for subscribing!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Footer Grid */}
                <div className="px-6 py-12 md:py-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-8">
                            {/* Brand Column */}
                            <div className="sm:col-span-2 md:col-span-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <img
                                        src="/cediman.png"
                                        alt="Cediman"
                                        className="h-10 w-auto"
                                    />
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Your premium destination for authentic football and basketball jerseys from the world's biggest teams.
                                </p>
                            </div>

                            {/* Shop Column */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Shop</h3>
                                <ul className="space-y-3 text-sm">
                                    <li>
                                        <Link href="/shop" className="text-gray-600 hover:text-orange-600 transition-colors">
                                            All Jerseys
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/teams" className="text-gray-600 hover:text-orange-600 transition-colors">
                                            Browse Teams
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/shop?sort=new" className="text-gray-600 hover:text-orange-600 transition-colors">
                                            New Arrivals
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Support Column */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Support</h3>
                                <ul className="space-y-3 text-sm">
                                    <li>
                                        <Link href="/track" className="text-gray-600 hover:text-orange-600 transition-colors">
                                            Track Order
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/account" className="text-gray-600 hover:text-orange-600 transition-colors">
                                            My Account
                                        </Link>
                                    </li>
                                    <li>
                                        <a href="mailto:support@cediman.com" className="text-gray-600 hover:text-orange-600 transition-colors">
                                            Contact Us
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Policies Column */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Legal</h3>
                                <ul className="space-y-3 text-sm">
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">
                                            Terms & Conditions
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">
                                            Shipping Info
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom divider */}
                        <div className="border-t border-gray-200 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                                <p>© {new Date().getFullYear()} Cediman. All rights reserved.</p>
                                <div className="flex gap-6">
                                    <a href="#" className="hover:text-orange-600 transition-colors">Twitter</a>
                                    <a href="#" className="hover:text-orange-600 transition-colors">Instagram</a>
                                    <a href="#" className="hover:text-orange-600 transition-colors">Facebook</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
