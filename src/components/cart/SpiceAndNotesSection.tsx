"use client";

import { FileText } from "lucide-react";

interface SpiceAndNotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export default function SpiceAndNotesSection({
  notes,
  onNotesChange,
}: SpiceAndNotesSectionProps) {
  return (
    <div className="space-y-1.5 pt-1">
      <label className="text-[11px] font-bold text-charcoal-800 flex items-center gap-1.5">
        <FileText className="w-3.5 h-3.5 text-terracotta-500" />
        <span>Cooking &amp; Delivery Instructions (Optional):</span>
      </label>
      <input
        type="text"
        placeholder="e.g. Extra salad & raita, call upon arrival, less oil"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
      />
    </div>
  );
}
