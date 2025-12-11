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
            title: "Premium Football Collection",
            video: "https://videos.pexels.com/video-files/19548560/19548560-hd_1280_720_25fps.mp4",
            buttons: [
              { label: "Shop All", href: "/shop" },
              { label: "Club Jerseys", href: "/shop?category=jersey" },
              { label: "Kits & Gear", href: "/shop?category=apparel" },
            ],
          }}
          rightSection={{
            title: "Elite Basketball Gear",
            video: "https://videos.pexels.com/video-files/29086331/12459282-hd_1080_1920_30fps.mp4",
            buttons: [
              { label: "Shop Basketball", href: "/shop?category=basketball" },
              { label: "Team Jerseys", href: "/shop?category=jersey" },
              { label: "Court Collection", href: "/shop?category=apparel" },
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
