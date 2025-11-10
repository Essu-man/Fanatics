import TopBanner from "./components/TopBanner";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import ProductSection from "./components/ProductSection";
import SportsRibbon from "./components/SportsRibbon";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--brand-gray-50)] text-zinc-900">
      <TopBanner />
      <Header />
      <SportsRibbon />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <Hero />

        <section className="mt-16">
          <ProductSection />
        </section>
      </main>

      <Footer />
    </div>
  );
}
