"use client";

import React, { TextareaHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, rows = 3, ...props }, ref) => {
    const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={areaId} className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          rows={rows}
          className={twMerge(
            clsx(
              "w-full bg-sand-100 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-charcoal-900 placeholder:text-charcoal-700/50 transition-colors focus:outline-none focus:border-terracotta-500 focus:bg-white resize-y",
              error ? "border-red-500 focus:border-red-500" : "",
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-[11px] font-semibold text-red-600">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-charcoal-700/70">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
