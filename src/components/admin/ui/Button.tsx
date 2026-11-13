"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "saffron";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-full transition-all cursor-pointer focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed select-none gap-2";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5",
    md: "text-xs sm:text-sm px-5 py-2.5",
    lg: "text-sm sm:text-base px-6 py-3.5",
  };

  const variantStyles = {
    primary: "bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-glow",
    secondary: "bg-charcoal-900 hover:bg-charcoal-800 text-white shadow-md",
    outline: "bg-transparent hover:bg-sand-200 border border-charcoal-900/30 text-charcoal-900",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md",
    ghost: "bg-transparent hover:bg-sand-200/80 text-charcoal-800",
    saffron: "bg-saffron-400 hover:bg-saffron-500 text-charcoal-900 shadow-md",
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
