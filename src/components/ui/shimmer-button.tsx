"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
  glow?: boolean;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#00F5D4",
      shimmerSize = "0.08em",
      shimmerDuration = "2.5s",
      borderRadius = "12px",
      background = "rgba(11, 15, 23, 0.95)",
      className,
      children,
      glow = true,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as React.CSSProperties
        }
        className={cn(
          "group relative z-0 inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-[#1F293D] px-6 py-3.5 text-white [background:var(--bg)] [border-radius:var(--radius)] transition-all duration-300 active:scale-95",
          glow && "hover:shadow-[0_0_25px_rgba(0,245,212,0.35)] hover:border-[#00F5D4]/60",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 overflow-visible [container-type:size]"
          )}
        >
          <div className="absolute inset-0 h-[100cqh] [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>

        {/* Backdrop */}
        <div className="absolute [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)] -z-20 transition-colors group-hover:bg-[#131A26]" />

        {/* Top subtle highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00F5D4]/50 to-transparent -z-10" />

        {children}
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";
