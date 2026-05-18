import * as React from "react";
import { cn } from "@/utils/cn";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "success"
      | "warning"
      | "stock-low"
      | "stock-ok"
      | "rx"
      | "otc";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants: Record<string, string> = {
    default:
      "border-transparent bg-primary dark:bg-emerald-600 text-primary-foreground dark:text-white shadow-sm dark:shadow-black/20",
    secondary:
      "border-transparent bg-secondary dark:bg-zinc-800 text-secondary-foreground dark:text-zinc-100 shadow-sm dark:shadow-black/20",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground shadow-sm dark:shadow-black/20",
    outline:
      "border border-input dark:border-zinc-700 bg-background dark:bg-zinc-950 text-foreground dark:text-zinc-100",
    success:
      "border-transparent bg-emerald-600 text-white shadow-sm dark:shadow-black/20",
    warning:
      "border-transparent bg-amber-500 text-white shadow-sm dark:shadow-black/20",
    "stock-low":
      "border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 animate-pulse shadow-sm dark:shadow-black/20",
    "stock-ok":
      "border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shadow-sm dark:shadow-black/20",
    rx: "border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 shadow-sm dark:shadow-black/20",
    otc: "border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 shadow-sm dark:shadow-black/20",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
