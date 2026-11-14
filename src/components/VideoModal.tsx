"use client";

import Image from "next/image";
import { useRestaurant } from "@/context/RestaurantContext";
import { X } from "lucide-react";

export default function VideoModal() {
  const { isVideoOpen, setIsVideoOpen, setSelectedCategory } = useRestaurant();

  if (!isVideoOpen) return null;

  const handleExplore = () => {
    setIsVideoOpen(false);
    setSelectedCategory("all");
    const el = document.getElementById("interactive-menu");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-charcoal-900 border border-white/15 rounded-4xl max-w-lg w-full overflow-hidden shadow-2xl text-white">
        <div className="relative h-64">
          <Image
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80"
            alt="Live Charcoal Grill"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/40 to-transparent flex items-end p-6">
            <div>
              <span className="bg-terracotta-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                Live Kitchen Cam
              </span>
              <h3 className="font-display font-bold text-2xl mt-2">
                Peshawari Iron Wok &amp; Koyla Pit
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsVideoOpen(false)}
            aria-label="Close Modal"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-charcoal-900/80 text-white flex items-center justify-center hover:bg-terracotta-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Hamari har Karahi order par taaza gosht, desi tamatar, hari mirch aur adrak ke lachon ke sath tez aag par tayyar ki jati hai. Koyla Bar B Q par asli desi ghee ki buraish!
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="px-5 py-2.5 rounded-full bg-white/10 text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleExplore}
              className="px-5 py-2.5 rounded-full bg-saffron-400 text-charcoal-900 text-xs font-extrabold hover:bg-white transition-colors cursor-pointer"
            >
              Explore Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
