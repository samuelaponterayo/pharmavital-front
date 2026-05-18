import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart, AlertCircle, Minus, Plus, Check } from "lucide-react";
import { cn } from "@/utils/cn";
import type { CartItem } from "@/store/cartStore";

interface AddToCartButtonProps {
  item: CartItem;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "lg";
}

export function AddToCartButton({
  item,
  className,
  variant = "default",
  size = "default",
}: AddToCartButtonProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const existing = items.find((i) => i.inventoryId === item.inventoryId);
  const inCart = !!existing;
  const cartQty = existing?.quantity ?? 0;
  const effectiveStock = item.stockAvailable ?? 0;
  const maxedOut = cartQty >= effectiveStock;
  const isLg = size === "lg";

  if (effectiveStock <= 0) {
    return (
      <Button disabled className={cn("gap-2 w-full", isLg && "h-12 text-base", className)} variant="outline">
        <AlertCircle className={cn("h-4 w-4", isLg && "h-5 w-5")} /> Agotado
      </Button>
    );
  }

  if (inCart) {
    return (
      <div className={cn("flex items-stretch rounded-lg border border-primary dark:border-emerald-600 overflow-hidden shadow-sm", isLg && "h-12", className)}>
        <button
          onClick={() => updateQuantity(item.inventoryId, cartQty - 1)}
          className="flex items-center justify-center w-11 shrink-0 bg-primary/5 dark:bg-emerald-500/5 hover:bg-primary/10 dark:hover:bg-emerald-500/10 text-primary dark:text-emerald-400 transition-colors"
        >
          <Minus className={cn("h-4 w-4", isLg && "h-5 w-5")} />
        </button>
        <span className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold bg-card dark:bg-zinc-900 text-foreground dark:text-zinc-100 tabular-nums">
          <Check className="h-3.5 w-3.5 text-success dark:text-emerald-400" />
          {cartQty} en carrito
        </span>
        <button
          onClick={() => updateQuantity(item.inventoryId, cartQty + 1)}
          disabled={maxedOut}
          className="flex items-center justify-center w-11 shrink-0 bg-primary/5 dark:bg-emerald-500/5 hover:bg-primary/10 dark:hover:bg-emerald-500/10 text-primary dark:text-emerald-400 transition-colors disabled:opacity-30"
        >
          <Plus className={cn("h-4 w-4", isLg && "h-5 w-5")} />
        </button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => addItem({ ...item, quantity: 1 })}
      className={cn("gap-2 w-full", isLg && "h-12 text-base", className)}
      variant={variant}
    >
      <ShoppingCart className={cn("h-4 w-4", isLg && "h-5 w-5")} /> Agregar al carrito
    </Button>
  );
}
