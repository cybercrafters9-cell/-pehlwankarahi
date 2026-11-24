import { RestaurantProvider } from "@/context/RestaurantContext";
import { SiteContentProvider } from "@/context/SiteContentContext";
import { SiteSlot } from "@/services/api";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedStrip from "@/components/FeaturedStrip";
import BentoGrid from "@/components/BentoGrid";
import EditorialShowcase from "@/components/EditorialShowcase";
import MenuSection from "@/components/MenuSection";
import ReservationSection from "@/components/ReservationSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import OrderVerificationModal from "@/components/OrderVerificationModal";
import VideoModal from "@/components/VideoModal";
import MenuModal from "@/components/MenuModal";
import ToastContainer from "@/components/Toast";

async function getInitialSlots(): Promise<Record<string, SiteSlot>> {
  try {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";
    const cleanUrl = rawUrl.replace(/\/+$/, "");
    const res = await fetch(`${cleanUrl}/site-content`, {
      next: { revalidate: 15 },
    });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data?.slots || {};
  } catch {
    return {};
  }
}

export default async function Home() {
  const slots = await getInitialSlots();

  return (
    <RestaurantProvider>
      <SiteContentProvider initialSlots={slots}>
        <main className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-6">
          <Navbar />
          <Hero />
          <FeaturedStrip />
          <MenuSection />
          <BentoGrid />
          <EditorialShowcase />
          <ReservationSection />
          <Footer />
          <CartDrawer />
          <OrderVerificationModal />
          <VideoModal />
          <MenuModal />
          <ToastContainer />
        </main>
      </SiteContentProvider>
    </RestaurantProvider>
  );
}
