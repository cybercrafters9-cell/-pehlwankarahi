"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps {
  title?: string;
  subtitle?: string;
  badge?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Card({
  title,
  subtitle,
  badge,
  action,
  children,
  footer,
  className,
}: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-sand-50 border border-sand-200 rounded-3xl p-5 sm:p-6 shadow-soft transition-all",
          className
        )
      )}
    >
      {(title || action || badge) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-sand-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              {title && <h3 className="font-display font-bold text-lg sm:text-xl text-charcoal-900">{title}</h3>}
              {badge}
            </div>
            {subtitle && <p className="text-xs text-charcoal-700/70 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-5 pt-4 border-t border-sand-200/80 flex items-center justify-between">{footer}</div>}
    </div>
  );
}
