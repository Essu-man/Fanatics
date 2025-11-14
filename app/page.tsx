import Header from "./components/Header";
import SportsNav from "./components/SportsNav";
import ShopYourTeams from "./components/ShopYourTeams";
import PromoBanner from "./components/PromoBanner";
import FeatureRibbons from "./components/FeatureRibbons";
import GiftCategories from "./components/GiftCategories";
import SplitBanner from "./components/SplitBanner";
import NewArrivals from "./components/NewArrivals";
import ColdWeatherGifts from "./components/ColdWeatherGifts";
import TradingCards from "./components/TradingCards";
import FanaticsFest from "./components/FanaticsFest";
import CollabsCollections from "./components/CollabsCollections";
import MilitaryWearBanner from "./components/MilitaryWearBanner";
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
      <GiftCategories />
      <SplitBanner
        leftSection={{
          title: "Salute To Service",
          image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=450&fit=crop",
          buttons: [
            { label: "Shop All", href: "#" },
            { label: "Hats", href: "#" },
            { label: "Sweatshirts", href: "#" },
          ],
        }}
        rightSection={{
          title: "NFL Rivalries",
          image: "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=800&h=450&fit=crop",
          buttons: [
            { label: "Shop All", href: "#" },
            { label: "Men's", href: "#" },
            { label: "Women's", href: "#" },
          ],
        }}
      />
      <NewArrivals />
      <ColdWeatherGifts />
      <TradingCards />
      <FanaticsFest />
      <CollabsCollections />
      <MilitaryWearBanner />
      <RecentlyViewed />
      </main>
      <Footer />
    </div>
  );
}
