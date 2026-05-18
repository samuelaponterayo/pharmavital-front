import { useCartStore, useCartCount, useCartTotal } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/utils/formatters";
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { cn } from "@/utils/cn";
import { useCallback } from "react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const count = useCartCount();
  const total = useCartTotal();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const hasOutOfStock = items.some((i) => (i.stockAvailable ?? 0) <= 0);

  const handleCheckout = useCallback(() => {
    if (items.some((i) => (i.stockAvailable ?? 0) <= 0)) return;
    onClose();
    if (isAuthenticated) {
      navigate("/app/orders/new");
    } else {
      navigate("/register", {
        state: { from: "/app/orders/new", message: "Crea una cuenta para completar tu pedido" },
      });
    }
  }, [isAuthenticated, navigate, onClose, items]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-card dark:bg-zinc-900 border-l dark:border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col will-change-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-5 w-5 text-primary dark:text-emerald-400" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary dark:bg-emerald-600 text-primary-foreground dark:text-emerald-100 text-[10px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </div>
            <h2 className="font-semibold text-lg">Tu Carrito</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground dark:text-zinc-400 font-medium">Tu carrito está vacío</p>
            <p className="text-xs text-muted-foreground/60 dark:text-zinc-500 mt-1">
              Agrega productos desde la tienda
            </p>
            <Button variant="outline" className="mt-6" onClick={onClose}>
              Explorar productos
            </Button>
          </div>
        ) : (
          <>
            {hasOutOfStock && (
              <div className="mx-5 mt-3 p-3 rounded-lg border border-destructive/40 dark:border-red-500/40 bg-destructive/5 dark:bg-red-500/5 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-destructive dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-destructive dark:text-red-400">
                    Algunos productos no están disponibles
                  </p>
                  <p className="text-[11px] text-muted-foreground dark:text-zinc-400 mt-0.5">
                    Elimínalos del carrito para continuar con el pedido
                  </p>
                </div>
              </div>
            )}
            <ScrollArea className="flex-1 px-5 py-3">
              <div className="space-y-1">
                {items.map((item) => (
                  <div
                    key={item.inventoryId}
                    className="flex gap-3 py-3 border-b dark:border-zinc-800 last:border-0"
                  >
                    <div className="w-14 h-14 rounded-lg bg-muted dark:bg-zinc-800 shrink-0 flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.medicineName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <ShoppingCart className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.medicineName}
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-zinc-400 truncate">
                        {item.concentration} {item.presentation}
                      </p>
                      {item.requiresPrescription && (
                        <span className="inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          Rx
                        </span>
                      )}
                      {item.stockAvailable <= 0 && (
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
                          <AlertCircle className="h-2.5 w-2.5" /> Agotado
                        </span>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-semibold text-primary dark:text-emerald-400">
                          {formatCurrency(item.price)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.inventoryId, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-xs tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.inventoryId, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stockAvailable}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.inventoryId)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t dark:border-zinc-800 px-5 py-4 space-y-3 shrink-0">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground dark:text-zinc-400">Subtotal</span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground dark:text-zinc-500">
                <span>Envío e impuestos calculados al finalizar</span>
                <span>{count} {count === 1 ? "item" : "items"}</span>
              </div>
              <Button
                className="w-full gap-2"
                onClick={handleCheckout}
                disabled={hasOutOfStock}
              >
                {hasOutOfStock
                  ? "Retira productos agotados"
                  : isAuthenticated
                    ? "Continuar al pedido"
                    : "Crear cuenta para comprar"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              {hasOutOfStock && (
                <p className="text-[10px] text-center text-destructive dark:text-red-400">
                  Hay productos agotados en tu carrito
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
