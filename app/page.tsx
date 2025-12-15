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
            title: "Epic Football Moments",
            video: "https://videos.pexels.com/video-files/19548560/19548560-hd_1280_720_25fps.mp4",
            buttons: [
              { label: "Shop Jerseys", href: "/shop" },
              { label: "Team Collection", href: "/teams" },
            ],
          }}
          rightSection={{
            title: "Legendary Players",
            video: "https://videos.pexels.com/video-files/12459282/12459282-hd_1080_1920_30fps.mp4",
            buttons: [
              { label: "Browse Gear", href: "/shop" },
              { label: "Fan Favorites", href: "/shop?sort=popular" },
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
