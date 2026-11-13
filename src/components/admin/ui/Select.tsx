"use client";

import React, { SelectHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={twMerge(
            clsx(
              "w-full bg-sand-100 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-charcoal-900 transition-colors focus:outline-none focus:border-terracotta-500 focus:bg-white cursor-pointer",
              error ? "border-red-500 focus:border-red-500" : "",
              className
            )
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[11px] font-semibold text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
