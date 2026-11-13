"use client";

import React, { ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "charcoal" | "terracotta" | "saffron" | "sand";
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = "charcoal", children, className, dot = false }: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-100 text-emerald-800 border-emerald-300",
    warning: "bg-amber-100 text-amber-900 border-amber-300",
    danger: "bg-red-100 text-red-800 border-red-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
    charcoal: "bg-charcoal-900 text-white border-charcoal-800",
    terracotta: "bg-terracotta-500 text-white border-terracotta-600",
    saffron: "bg-saffron-400 text-charcoal-900 border-saffron-500",
    sand: "bg-sand-200 text-charcoal-800 border-sand-300",
  };

  const dotColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    charcoal: "bg-saffron-400",
    terracotta: "bg-white",
    saffron: "bg-charcoal-900",
    sand: "bg-terracotta-500",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border shadow-sm",
          variantStyles[variant],
          className
        )
      )}
    >
      {dot && <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
}
