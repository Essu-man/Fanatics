"use client";

import Link from "next/link";
import { Store, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import VendorApplyForm from "@/app/components/vendor/VendorApplyForm";

export default function VendorApplyPage() {
    return (
        <div className="min-h-screen bg-[#f6f7f4]">
            <Header />

            <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-emerald-950 via-emerald-900 to-zinc-900 text-white py-20 px-6">
                <div className="mx-auto max-w-4xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold mb-6">
                        <Store className="h-4 w-4" />
                        Seller program
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Sell on Cediman</h1>
                    <p className="text-lg text-emerald-100/90 max-w-2xl mx-auto">
                        Join Ghana&apos;s marketplace for jerseys, lifestyle, and more. One checkout for customers, one
                        dashboard for you.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-16 grid gap-12 lg:grid-cols-2 lg:items-start">
                <div>
                    <h2 className="text-3xl font-black text-zinc-900 mb-6">Start your journey today</h2>
                    <p className="text-lg text-zinc-600 mb-10">
                        Tell us about your business. Our onboarding team will review your application and help you set up
                        your store.
                    </p>

                    <div className="space-y-6 mb-10">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Verified sellers",
                                desc: "We review every application before you go live.",
                            },
                            {
                                icon: TrendingUp,
                                title: "Reach more fans",
                                desc: "List alongside Cediman's official jersey catalog.",
                            },
                            {
                                icon: Zap,
                                title: "Fast setup",
                                desc: "Upload a sample product and certificate to speed up approval.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900">{item.title}</h4>
                                    <p className="text-sm text-zinc-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-zinc-500">
                        New seller?{" "}
                        <Link href="/signup" className="font-semibold text-emerald-800 hover:underline">
                            Sign up with login + application
                        </Link>
                        . Already have an account?{" "}
                        <Link href="/login?redirect=/vendor/apply" className="font-semibold text-emerald-800 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-zinc-100">
                    <VendorApplyForm />
                </div>
            </section>

            <Footer />
        </div>
    );
}
