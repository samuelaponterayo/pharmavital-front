import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useFetchList } from "@/hooks/useFetchList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import { ordersService } from "@/api/services/orders.service";
import { medicinesService } from "@/api/services/medicines.service";
import { inventoryService } from "@/api/services/inventory.service";
import { usersService } from "@/api/services/users.service";
import { LayoutDashboard, ShoppingCart, Pill, Users, PackageSearch } from "lucide-react";
import type { Order, Inventory } from "@/types";

export function DashboardPage() {
  const { user } = useAuth();

  const {
    data: recentOrders,
    loading: ordersLoading,
    error: ordersError,
  } = useFetchList<Order>(
    () => ordersService.list({ limit: 5 }),
    [user]
  );

  const {
    data: allInventory,
    loading: invLoading,
    error: invError,
  } = useFetchList<Inventory>(
    () => inventoryService.list(),
    [user]
  );

  useEffect(() => {
    if (ordersError) console.error("Error loading orders:", ordersError);
  }, [ordersError]);

  useEffect(() => {
    if (invError) console.error("Error loading inventory:", invError);
  }, [invError]);

  const [medicinesCount, setMedicinesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      setCountsLoading(true);

      try {
        const medsRes = await medicinesService.list({ limit: 1 });
        if (!cancelled) setMedicinesCount(medsRes.meta.limit);
      } catch (err) {
        console.error("Error loading medicines count:", err);
      }

      if (user?.role?.nombre === "administrador") {
        try {
          const usersRes = await usersService.list({ limit: 1 });
          if (!cancelled) setUsersCount(usersRes.meta.limit);
        } catch (err) {
          console.error("Error loading users count:", err);
        }
      }

      if (!cancelled) setCountsLoading(false);
    };

    loadCounts();
    return () => { cancelled = true; };
  }, [user]);

  const loading = ordersLoading || invLoading || countsLoading;

  const lowStockItems = allInventory
    .filter((i) => Number(i.stock_disponible) <= Number(i.stock_minimo))
    .slice(0, 5);

  const lowStockCount = allInventory.filter(
    (i) => Number(i.stock_disponible) <= Number(i.stock_minimo)
  ).length;

  const statusVariant = (estado: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
      pendiente: "warning",
      confirmado: "secondary",
      en_preparacion: "secondary",
      listo_despacho: "default",
      en_domicilio: "default",
      entregado: "success",
      cancelado: "destructive",
      devuelto: "destructive",
    };
    return map[estado] ?? "outline";
  };

  const statusBorderColor = (estado: string): string => {
    const map: Record<string, string> = {
      pendiente: "border-l-amber-500",
      confirmado: "border-l-blue-400",
      en_preparacion: "border-l-indigo-400",
      listo_despacho: "border-l-sky-400",
      en_domicilio: "border-l-cyan-400",
      entregado: "border-l-emerald-500",
      cancelado: "border-l-red-500",
      devuelto: "border-l-red-500",
    };
    return map[estado] ?? "border-l-slate-300";
  };

  const stockSeverity = (disponible: number, minimo: number): { border: string; bg: string; badge: "stock-low" | "warning"; label: string } => {
    if (disponible <= 0) {
      return { border: "border-l-red-500", bg: "bg-red-50/70 dark:bg-red-950/50", badge: "stock-low", label: "Agotado" };
    }
    if (disponible <= Number(minimo) / 2) {
      return { border: "border-l-amber-500", bg: "bg-amber-50/70 dark:bg-amber-950/50", badge: "stock-low", label: "Crítico" };
    }
    return { border: "border-l-amber-400", bg: "bg-amber-50/40 dark:bg-amber-950/30", badge: "warning", label: "Bajo" };
  };

  const today = new Date();
  const formattedToday = today.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de Control"
        description={`Bienvenido, ${user?.nombre} — ${formattedToday}`}
        icon={<LayoutDashboard className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pedidos Activos"
          value={recentOrders.length}
          icon={ShoppingCart}
          color="emerald"
        />
        <StatCard
          title="Medicamentos"
          value={medicinesCount}
          icon={Pill}
          color="teal"
        />
        <StatCard
          title="Stock Bajo"
          value={lowStockCount}
          icon={PackageSearch}
          color="amber"
        />
        <StatCard
          title="Usuarios"
          value={usersCount}
          icon={Users}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <EmptyState
                icon="box"
                title="No hay pedidos recientes"
                description="Los pedidos nuevos aparecerán aquí una vez sean registrados en el sistema."
              />
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border border-l-4 bg-card dark:bg-zinc-900 px-4 py-3 transition-colors hover:bg-muted/50 dark:hover:bg-zinc-800/50",
                      statusBorderColor(order.estado)
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{order.numero_pedido}</p>
                      <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-0.5">
                        {formatDate(order.created_at!)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrency(Number(order.total))}
                      </span>
                      <Badge variant={statusVariant(order.estado)}>
                        {order.estado.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas de Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <EmptyState
                icon="pill"
                title="Sin alertas de stock"
                description="Todos los medicamentos están correctamente abastecidos. No hay productos por debajo del stock mínimo."
              />
            ) : (
              <div className="space-y-2">
                {lowStockItems.map((item) => {
                  const severity = stockSeverity(
                    Number(item.stock_disponible),
                    Number(item.stock_minimo)
                  );
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg border border-l-4 px-4 py-3 transition-colors hover:bg-muted/50 dark:hover:bg-zinc-800/50",
                        severity.border,
                        severity.bg
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">
                          {item.medicamento?.nombre_comercial ?? "Medicamento"} — Lote {item.lote}
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-0.5">
                          Vence: {formatDate(item.fecha_vencimiento)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <Badge variant={severity.badge}>
                          {String(item.stock_disponible)} uds
                        </Badge>
                        <span className="text-xs text-muted-foreground dark:text-zinc-400">
                          Mín: {String(item.stock_minimo)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const statColorStyles = {
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    icon: "text-emerald-600 dark:text-emerald-300",
    value: "text-emerald-700 dark:text-emerald-300",
    shadow: "shadow-emerald-100/60",
  },
  teal: {
    bg: "bg-teal-100 dark:bg-teal-900/50",
    icon: "text-teal-600 dark:text-teal-300",
    value: "text-teal-700 dark:text-teal-300",
    shadow: "shadow-teal-100/60",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/50",
    icon: "text-amber-600 dark:text-amber-300",
    value: "text-amber-700 dark:text-amber-300",
    shadow: "shadow-amber-100/60",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/50",
    icon: "text-blue-600 dark:text-blue-300",
    value: "text-blue-700 dark:text-blue-300",
    shadow: "shadow-blue-100/60",
  },
};

function StatCard({
  title,
  value,
  icon: Icon,
  color = "emerald",
  className,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: "emerald" | "teal" | "amber" | "blue";
  className?: string;
}) {
  const styles = statColorStyles[color];

  return (
    <Card className={cn("overflow-hidden transition-shadow hover:shadow-md dark:shadow-black/30", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground dark:text-zinc-400">
          {title}
        </CardTitle>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", styles.bg, styles.shadow)}>
          <Icon className={cn("h-5 w-5", styles.icon)} />
        </div>
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-bold tracking-tight tabular-nums", styles.value)}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-1">Resumen General</p>
      </CardContent>
    </Card>
  );
}
