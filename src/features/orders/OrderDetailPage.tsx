import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ordersService } from "@/api/services/orders.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/formatters";
import { ArrowLeft, Circle, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import type { Order } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusLabel = (estado: string): string => {
  const map: Record<string, string> = {
    pendiente: "Pendiente",
    confirmado: "Confirmado",
    en_preparacion: "En Preparación",
    listo_despacho: "Listo para Despacho",
    en_domicilio: "En Domicilio",
    entregado: "Entregado",
    cancelado: "Cancelado",
    devuelto: "Devuelto",
  };
  return map[estado] ?? estado;
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await ordersService.getById(id);
        setOrder(res.data ?? null);
      } catch (err) {
        console.error("Error loading order:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <Skeleton className="h-96" />;

  if (!order) {
    return (
      <EmptyState
        icon="error"
        title="Pedido no encontrado"
        action={{ label: "Volver a pedidos", onClick: () => navigate("/orders") }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="gap-2 text-green-700 dark:text-emerald-300 hover:text-green-800 dark:hover:text-emerald-200 hover:bg-green-50 dark:hover:bg-emerald-950" onClick={() => navigate("/orders")}>
        <ArrowLeft className="h-4 w-4" /> Volver a pedidos
      </Button>

      <PageHeader
        title={`Pedido ${order.numero_pedido}`}
        description={statusLabel(order.estado)}
        icon={<ShoppingCart className="h-5 w-5" />}
      />

       <Card className="border-green-100 dark:border-zinc-800 shadow-sm dark:shadow-black/30 overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-emerald-300 mb-3">Items del Pedido</h3>
              <div className="rounded-lg border border-green-100 dark:border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicamento</TableHead>
                      <TableHead className="text-center">Cant.</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-center">IVA</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.detalles?.map((det) => (
                      <TableRow key={det.id}>
                        <TableCell className="font-medium text-sm">{det.medicamento?.nombre_comercial ?? "—"}</TableCell>
                        <TableCell className="text-center">{det.cantidad}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(det.precio_unitario))}</TableCell>
                        <TableCell className="text-center text-muted-foreground dark:text-zinc-400">{String(det.porcentaje_iva)}%</TableCell>
                        <TableCell className="text-right font-semibold text-green-900 dark:text-emerald-200">{formatCurrency(Number(det.subtotal))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border-green-100 dark:border-zinc-800 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-emerald-300">Totales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <Row label="Subtotal" value={formatCurrency(Number(order.subtotal))} />
                  <Row label="Descuento Cupón" value={`-${formatCurrency(Number(order.descuento_cupon))}`} muted />
                  <Row label="Descuento Directo" value={`-${formatCurrency(Number(order.descuento_directo))}`} muted />
                  <Row label="Domicilio" value={formatCurrency(Number(order.costo_domicilio))} />
                  <Row label="Impuestos" value={formatCurrency(Number(order.impuestos))} />
                  <div className="border-t dark:border-zinc-800 border-green-100 pt-2.5">
                    <Row label="Total" value={formatCurrency(Number(order.total))} bold />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-100 dark:border-zinc-800 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-emerald-300">Información</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <Row label="Cliente" value={`${order.usuario?.nombre ?? "—"} ${order.usuario?.apellido ?? ""}`} />
                  <Row label="Email" value={order.usuario?.email ?? "—"} />
                  <Row label="Dirección" value={order.direccion?.direccion ?? "—"} />
                  <div className="border-t dark:border-zinc-800 border-dashed border-green-100 pt-2.5">
                    <Row label="Método de Pago" value={order.metodo_pago} />
                    <Row
                      label="Estado Pago"
                      value={order.estado_pago}
                      badge
                      variant={order.estado_pago === "aprobado" ? "success" : order.estado_pago === "rechazado" ? "destructive" : order.estado_pago === "pendiente" ? "warning" : "secondary"}
                    />
                  </div>
                </CardContent>
              </Card>

              {order.historialEstados && order.historialEstados.length > 0 && (
                <Card className="border-green-100 dark:border-zinc-800 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-emerald-300">Historial de Estados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative pl-5 space-y-3">
                      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-green-200 dark:bg-zinc-700" />
                      {order.historialEstados.map((h, i) => (
                        <div key={h.id} className="relative">
                          <div className="absolute left-[-14px] top-1.5">
                            <Circle className="h-3 w-3 fill-green-200 text-green-200" />
                            {i === 0 && <div className="absolute left-[5px] -top-1.5 h-3 w-0.5 bg-white dark:bg-zinc-900" />}
                            {i === (order.historialEstados?.length ?? 0) - 1 && (
                              <div className="absolute left-[5px] top-3 h-3 w-0.5 bg-white dark:bg-zinc-900" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900 dark:text-emerald-200">
                              {h.estado_ant ? statusLabel(h.estado_ant) : "Inicio"} → {statusLabel(h.estado_nvo)}
                            </p>
                            {h.comentario && (
                              <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-0.5">{h.comentario}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
  badge,
  variant,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  badge?: boolean;
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground dark:text-zinc-400">{label}</span>
      {badge && variant ? (
        <Badge variant={variant} className="text-xs px-1.5 py-0 font-medium">{value}</Badge>
      ) : (
         <span className={cn(bold ? "font-bold text-green-900 dark:text-emerald-200 text-base" : muted ? "font-medium text-red-600 dark:text-red-400" : "font-medium text-green-900 dark:text-emerald-200")}>
          {value}
        </span>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
