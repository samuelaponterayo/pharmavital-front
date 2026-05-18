import { cn } from "@/utils/cn";
import { AlertCircle, PackageSearch, Pill, SearchX, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: "search" | "box" | "error" | "pill" | "stethoscope";
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

const icons = {
  search: SearchX,
  box: PackageSearch,
  error: AlertCircle,
  pill: Pill,
  stethoscope: Stethoscope,
};

export function EmptyState({
  icon = "search",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className={cn("flex flex-col items-center justify-center py-14 text-center", className)}>
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950 ring-4 ring-emerald-50/50 dark:ring-emerald-950/50">
        <Icon className="h-10 w-10 text-emerald-600 dark:text-emerald-200" />
      </div>
      <p className="text-sm font-semibold text-foreground dark:text-zinc-100">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-xs text-xs text-muted-foreground dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button variant="outline" size="sm" className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
