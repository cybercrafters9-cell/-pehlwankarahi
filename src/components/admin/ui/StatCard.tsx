"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  subtext?: string;
  trend?: string;
  colorScheme?: "terracotta" | "charcoal" | "saffron" | "emerald";
}

export function StatCard({
  label,
  value,
  icon,
  subtext,
  trend,
  colorScheme = "terracotta",
}: StatCardProps) {
  const iconBg = {
    terracotta: "bg-terracotta-500/15 text-terracotta-500",
    charcoal: "bg-charcoal-900/10 text-charcoal-900",
    saffron: "bg-saffron-400/20 text-charcoal-900",
    emerald: "bg-emerald-500/15 text-emerald-700",
  };

  return (
    <div className="bg-sand-50 border border-sand-200 rounded-3xl p-5 shadow-soft flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal-700/70">{label}</p>
        <p className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">{value}</p>
        {(subtext || trend) && (
          <div className="flex items-center gap-1.5 pt-1">
            {trend && <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{trend}</span>}
            {subtext && <span className="text-xs text-charcoal-700/70">{subtext}</span>}
          </div>
        )}
      </div>
      <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", iconBg[colorScheme])}>
        {icon}
      </div>
    </div>
  );
}
