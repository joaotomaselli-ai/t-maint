"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  variant?: "teal" | "dark" | "whatsapp" | "outline" | "amber" | "cyan";
  className?: string;
  children?: React.ReactNode;
  glow?: boolean;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor,
      shimmerSize = "0.08em",
      shimmerDuration = "2.5s",
      borderRadius = "12px",
      variant = "teal",
      className,
      children,
      glow = true,
      ...props
    },
    ref
  ) => {
    const defaultShimmer =
      shimmerColor || (variant === "teal" || variant === "cyan" ? "#FFFFFF" : variant === "amber" ? "#F59E0B" : variant === "whatsapp" ? "#FFFFFF" : "#00F5D4");

    const variantStyles = {
      teal: "bg-primary text-primary-foreground hover:bg-primary/95 font-bold border-brand-300/40",
      cyan: "bg-brand-500 text-slate-950 hover:bg-brand-400 font-bold border-brand-300/40",
      amber: "bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold border-amber-300/40",
      dark: "bg-card text-white hover:bg-muted font-semibold border-border hover:border-primary/60",
      whatsapp: "bg-[#25D366] text-slate-950 hover:bg-[#22bf5b] font-bold border-emerald-300/40",
      outline: "bg-transparent text-white hover:bg-card border-border hover:border-primary/60",
    };

    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": defaultShimmer,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
          } as React.CSSProperties
        }
        className={cn(
          "group relative z-0 inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3.5 [border-radius:var(--radius)] transition-all duration-300 active:scale-95 border",
          variantStyles[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Rotating Spark container */}
        <div
          className={cn(
            "-z-30 blur-[1px]",
            "absolute inset-0 overflow-visible [container-type:size]"
          )}
        >
          <div className="absolute inset-0 h-[100cqh] [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0] opacity-70" />
          </div>
        </div>

        {/* Top subtle highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent -z-10" />

        {/* Content container ensuring high z-index and perfect contrast */}
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";
