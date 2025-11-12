import Header from "./components/Header";
import SportsNav from "./components/SportsNav";
import ShopYourTeams from "./components/ShopYourTeams";
import PromoBanner from "./components/PromoBanner";
import FeatureRibbons from "./components/FeatureRibbons";
import HomeProductSections from "./components/HomeProductSections";
import RecentlyViewed from "./components/RecentlyViewed";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main id="main-content">
      <Header />
      <SportsNav />
      <ShopYourTeams />
      <PromoBanner />
      <FeatureRibbons />
      <HomeProductSections />
      <RecentlyViewed />
      </main>
      <Footer />
    </div>
  );
}
