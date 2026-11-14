"use client";

import { Flame } from "lucide-react";

interface SpiceAndNotesSectionProps {
  spiceLevel: string;
  setSpiceLevel: (lvl: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

const SPICE_LEVELS = ["Namkeen Mild", "Chatpata Desi", "Full Angara"] as const;

export default function SpiceAndNotesSection({
  spiceLevel,
  setSpiceLevel,
  notes,
  onNotesChange,
}: SpiceAndNotesSectionProps) {
  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-charcoal-800 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-terracotta-500" />
          <span>Spice Level:</span>
        </label>
        <span className="text-xs font-extrabold text-terracotta-600">{spiceLevel}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {SPICE_LEVELS.map((lvl) => (
          <button
            type="button"
            key={lvl}
            onClick={() => setSpiceLevel(lvl)}
            className={`text-[11px] font-bold py-2 px-1 rounded-xl transition-all border cursor-pointer ${
              spiceLevel === lvl
                ? "bg-charcoal-900 text-white border-charcoal-900 shadow-sm"
                : "bg-white text-charcoal-800 border-sand-300 hover:bg-sand-200"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-[11px] font-bold text-charcoal-800 mb-1 mt-2">
          Cooking / Delivery Instructions (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Extra ginger juliennes, less oil, call before arrival"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
        />
      </div>
    </div>
  );
}
