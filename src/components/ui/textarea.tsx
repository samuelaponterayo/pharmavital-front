import * as React from "react";
import { cn } from "@/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-green-200/60 dark:border-zinc-800/60 bg-background dark:bg-zinc-950 px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-green-300/80 dark:placeholder:text-zinc-500/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 focus-visible:border-green-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
