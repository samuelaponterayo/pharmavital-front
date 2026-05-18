import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/utils/cn";

type TransitionVariant = "circle" | "square" | "diamond" | "rectangle" | "hexagon" | "star";

interface AnimatedThemeTogglerProps {
  className?: string;
  duration?: number;
  variant?: TransitionVariant;
}

function getClipPath(shape: TransitionVariant): string {
  switch (shape) {
    case "square":
      return "inset(0 0 0 0 round 8px)";
    case "diamond":
      return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
    case "rectangle":
      return "inset(0 0 0 0 round 4px)";
    case "hexagon":
      return "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
    case "star":
      return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
    case "circle":
    default:
      return "circle(0px at var(--x) var(--y))";
  }
}

export function AnimatedThemeToggler({
  className,
  duration = 500,
  variant = "circle",
}: AnimatedThemeTogglerProps) {
  const { isDark, toggle } = useTheme();

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = `${rect.left + rect.width / 2}px`;
    const y = `${rect.top + rect.height / 2}px`;

    if (!document.startViewTransition) {
      toggle();
      return;
    }

    const transition = document.startViewTransition(() => {
      toggle();
    });

    transition.ready.then(() => {
      const clipPath = getClipPath(variant)
        .replace("var(--x)", x)
        .replace("var(--y)", y);

      document.documentElement.animate(
        {
          clipPath: [
            clipPath,
            variant === "circle"
              ? `circle(150% at ${x} ${y})`
              : getClipPath("circle"),
          ],
        },
        {
          duration,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative flex items-center justify-center h-9 w-9 rounded-md transition-colors hover:bg-accent text-muted-foreground hover:text-foreground",
        className
      )}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <Sun
        className={cn(
          "h-[18px] w-[18px] transition-all duration-300",
          isDark ? "scale-0 rotate-90 opacity-0 absolute" : "scale-100 rotate-0 opacity-100"
        )}
      />
      <Moon
        className={cn(
          "h-[18px] w-[18px] transition-all duration-300",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0 absolute"
        )}
      />
    </button>
  );
}
