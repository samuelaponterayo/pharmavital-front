import * as React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const buttonVariants = {
  variant: {
    default:
      "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/20",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm dark:shadow-black/20",
    outline:
      "border border-input dark:border-zinc-700 bg-background dark:bg-zinc-950 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700 active:bg-emerald-100 dark:active:bg-emerald-900/50",
    secondary:
      "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 active:bg-slate-300 dark:active:bg-zinc-600",
    ghost:
      "hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-300 active:bg-emerald-100 dark:active:bg-emerald-900/50",
    link: "text-emerald-600 underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-5 py-2",
    sm: "h-9 rounded-lg px-3 text-xs",
    lg: "h-12 rounded-lg px-8 text-base",
    icon: "h-10 w-10",
  },
};

function getVariantClasses(
  variant: keyof typeof buttonVariants.variant = "default",
  size: keyof typeof buttonVariants.size = "default"
) {
  return `${buttonVariants.variant[variant]} ${buttonVariants.size[size]}`;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        getVariantClasses(variant, size),
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
