import AuroraBackground from "@/components/shared/AuroraBackground";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import StatsAndSteps from "@/components/home/StatsAndSteps";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsAndSteps />
      <Footer />
    </main>
  );
}
