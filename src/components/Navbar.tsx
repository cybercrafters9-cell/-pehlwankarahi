"use client";

import { useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { ShoppingBag, ArrowUpRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const { cart, setIsCartOpen, setSelectedCategory, setIsMenuModalOpen } = useRestaurant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleNavClick = (sectionId: string, category?: string) => {
    setMobileMenuOpen(false);
    if (category) {
      setSelectedCategory(category);
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-2 sm:top-3 z-40 bg-sand-100/90 backdrop-blur-md rounded-full px-4 sm:px-7 py-2.5 sm:py-3 mb-3 sm:mb-5 border border-sand-200/90 shadow-sm transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Brand Logo */}
        <a
          href="#"
          className="flex items-center cursor-pointer select-none group"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="font-serif italic font-bold text-2xl sm:text-3xl tracking-tight text-charcoal-900 group-hover:opacity-90 transition-opacity">
            Pehalwan <span className="text-terracotta-500">Karahi.</span>
          </span>
        </a>

        {/* Center: Simplified Navigation (Home & Restaurant Menu) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-charcoal-800/80">
          <button
            onClick={() => handleNavClick("hero")}
            className="hover:text-terracotta-500 transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => setIsMenuModalOpen(true)}
            className="hover:text-terracotta-500 transition-colors cursor-pointer"
          >
            Restaurant Menu
          </button>
        </nav>

        {/* Right: Cart & Order Now CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Cart Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Cart"
            className="relative w-10 h-10 rounded-full bg-sand-200/90 hover:bg-charcoal-900 hover:text-white flex items-center justify-center text-charcoal-900 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-terracotta-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Order Now Pill Button */}
          <button
            onClick={() => handleNavClick("interactive-menu")}
            className="bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 rounded-full shadow-glow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Order Now</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden w-10 h-10 rounded-full bg-sand-200 flex items-center justify-center text-charcoal-900 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-sand-200 flex flex-col gap-2 pb-2">
          <button
            onClick={() => handleNavClick("hero")}
            className="text-left py-2 px-3 rounded-lg hover:bg-sand-200 text-sm font-semibold text-charcoal-900"
          >
            Home
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsMenuModalOpen(true);
            }}
            className="text-left py-2 px-3 rounded-lg hover:bg-sand-200 text-sm font-semibold text-charcoal-900"
          >
            Restaurant Menu
          </button>
        </div>
      )}
    </header>
  );
}
