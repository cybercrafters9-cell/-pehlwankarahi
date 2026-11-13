"use client";

import React from "react";
import { RestaurantProvider } from "@/context/RestaurantContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedStrip from "@/components/FeaturedStrip";
import BentoGrid from "@/components/BentoGrid";
import EditorialShowcase from "@/components/EditorialShowcase";
import MenuSection from "@/components/MenuSection";
import ReservationSection from "@/components/ReservationSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import VideoModal from "@/components/VideoModal";
import MenuModal from "@/components/MenuModal";
import ToastContainer from "@/components/Toast";

export default function Home() {
  return (
    <RestaurantProvider>
      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-6">
        <Navbar />
        <Hero />
        <FeaturedStrip />
        <BentoGrid />
        <EditorialShowcase />
        <MenuSection />
        <ReservationSection />
        <Footer />
        <CartDrawer />
        <VideoModal />
        <MenuModal />
        <ToastContainer />
      </main>
    </RestaurantProvider>
  );
}
