"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  default: "bg-slate-800/80 text-slate-100",
  success: "bg-emerald-500/10 text-emerald-200",
  warning: "bg-amber-500/10 text-amber-200",
  danger: "bg-rose-500/10 text-rose-200",
  info: "bg-brand-500/10 text-brand-200"
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
        variants[variant],
        className
      )}
    />
  );
}
