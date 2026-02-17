import Header from "./components/Header";
import SportsNav from "./components/SportsNav";
import CategoryNav from "./components/CategoryNav";
import ShopYourTeams from "./components/ShopYourTeams";
import PromoBanner from "./components/PromoBanner";
import FeatureRibbons from "./components/FeatureRibbons";
import NewArrivals from "./components/NewArrivals";
import HomeProductSections from "./components/HomeProductSections";
import TeamCollections from "./components/TeamCollections";
import RecentlyViewed from "./components/RecentlyViewed";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main id="main-content">
        <Header />
        <SportsNav />
        <CategoryNav />
        <ShopYourTeams />
        <PromoBanner />
        <FeatureRibbons />
        <HomeProductSections />
        <TeamCollections />
        <NewArrivals />
        <RecentlyViewed />
      </main>
      <Footer />
    </div>
  );
}
