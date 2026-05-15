import type { Metadata } from "next";
import Header from "./components/Header";
import MarketplaceHome from "./components/home/MarketplaceHome";
import HomeProductSections from "./components/HomeProductSections";
import NewArrivals from "./components/NewArrivals";
import RecentlyViewed from "./components/RecentlyViewed";
import Footer from "./components/Footer";

export const metadata: Metadata = {
    title: "Cediman — Stores, jerseys & more",
    description:
        "Browse stores and categories on Cediman: official football and basketball jerseys, training gear, beauty, tech, and marketplace sellers — one cart, fast delivery in Ghana.",
};

export default function Home() {
    return (
        <div className="min-h-screen bg-[#f6f7f4] text-zinc-900">
            <main id="main-content">
                <Header />
                <MarketplaceHome />
                <div className="border-t border-zinc-200/80 bg-white">
                    <RecentlyViewed />
                </div>
            </main>
            <Footer />
        </div>
    );
}
