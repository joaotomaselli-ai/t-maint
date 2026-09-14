import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl bg-[#131A26]/80 border border-[#1F293D]/40 skeleton-shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
