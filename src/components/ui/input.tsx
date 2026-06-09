import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, ...props }, ref) => {
    const isSpecialType = type === "email" || type === "password" || type === "url" || type === "date" || type === "time" || type === "number" || type === "tel" || type === "file" || (typeof className === "string" && className.includes("normal-case"));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isSpecialType && typeof e.target.value === "string") {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        e.target.value = e.target.value.toUpperCase();
        if (start !== null && end !== null) {
          // setSelectionRange only works on certain input types, wrap in try-catch to be safe
          try {
            e.target.setSelectionRange(start, end);
          } catch (err) {}
        }
      }
      onChange?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          !isSpecialType && "uppercase",
          className,
        )}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
