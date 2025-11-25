import Header from "./components/Header";
import SportsNav from "./components/SportsNav";
import ShopYourTeams from "./components/ShopYourTeams";
import PromoBanner from "./components/PromoBanner";
import FeatureRibbons from "./components/FeatureRibbons";
import SplitBanner from "./components/SplitBanner";
import NewArrivals from "./components/NewArrivals";
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
        <SplitBanner
          leftSection={{
            title: "NBA Championship Gear",
            image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=450&fit=crop",
            buttons: [
              { label: "Shop All", href: "#" },
              { label: "Jerseys", href: "#" },
              { label: "Hats", href: "#" },
            ],
          }}
          rightSection={{
            title: "NFL Game Day Gear",
            image: "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=800&h=450&fit=crop",
            buttons: [
              { label: "Shop NFL", href: "/search?category=nfl" },
              { label: "Jerseys", href: "/search?category=jerseys&sport=nfl" },
              { label: "Accessories", href: "/search?category=accessories&sport=nfl" },
            ],
          }}
        />
        <NewArrivals />
        <RecentlyViewed />
      </main>
      <Footer />
    </div>
  );
}
