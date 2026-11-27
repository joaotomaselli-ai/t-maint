import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-card/80 border border-border/40 skeleton-shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
