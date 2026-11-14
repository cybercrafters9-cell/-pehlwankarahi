"use client";

import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 pointer-events-none text-charcoal-700/60">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              clsx(
                "w-full bg-sand-100 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-charcoal-900 placeholder:text-charcoal-700/50 transition-colors focus:outline-none focus:border-terracotta-500 focus:bg-white",
                icon ? "pl-10" : "",
                error ? "border-red-500 focus:border-red-500" : "",
                className
              )
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] font-semibold text-red-600">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-charcoal-700/70">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
