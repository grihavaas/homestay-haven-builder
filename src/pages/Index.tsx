import { Header } from "@/components/homestay/Header";
import { Hero } from "@/components/homestay/Hero";
import { About } from "@/components/homestay/About";
import { Rooms } from "@/components/homestay/Rooms";
import { Amenities } from "@/components/homestay/Amenities";
import { Gallery } from "@/components/homestay/Gallery";
import { Reviews } from "@/components/homestay/Reviews";
import { Host } from "@/components/homestay/Host";
import { Location } from "@/components/homestay/Location";
import { Booking } from "@/components/homestay/Booking";
import { HouseRules } from "@/components/homestay/HouseRules";
import { Footer } from "@/components/homestay/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <About />
      <Rooms />
      <Amenities />
      <Gallery />
      <Reviews />
      <Host />
      <Location />
      <Booking />
      <HouseRules />
      <Footer />
    </div>
  );
};

export default Index;
