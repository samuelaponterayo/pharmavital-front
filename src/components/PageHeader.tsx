import { cn } from "@/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-emerald-500/10 shrink-0">
            <div className="text-primary dark:text-emerald-400">{icon}</div>
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-primary dark:text-emerald-400 truncate leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground dark:text-zinc-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}
