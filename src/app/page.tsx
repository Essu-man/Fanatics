import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryRail from "@/components/CategoryRail";

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <CategoryRail />
      {/* duplicate section like screenshot if you want */}
      <CategoryRail />
    </main>
  );
}
