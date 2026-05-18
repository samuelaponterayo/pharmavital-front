import { useNavigate } from "react-router-dom";
import { ordersService } from "@/api/services/orders.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { Eye, ShoppingCart } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import type { Order, OrderState } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetchList } from "@/hooks/useFetchList";
import { useMutation } from "@/hooks/useMutation";
import { PageHeader } from "@/components/PageHeader";

const STATUS_OPTIONS: OrderState[] = [
  "pendiente", "confirmado", "en_preparacion", "listo_despacho", "en_domicilio", "entregado", "cancelado", "devuelto",
];

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

const paymentStatusVariant = (estado: string): "success" | "destructive" | "warning" | "secondary" => {
  if (estado === "aprobado") return "success";
  if (estado === "rechazado") return "destructive";
  if (estado === "pendiente") return "warning";
  return "secondary";
};

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

export function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders, loading, refresh } = useFetchList<Order>(
    () => ordersService.list(),
    []
  );

  const { mutate: updateStatus } = useMutation(
    async ([orderId, newStatus]: [string, string]) => {
      return ordersService.updateStatus(orderId, newStatus);
    },
    {
      successMsg: "Estado actualizado",
      onSuccess: () => refresh(),
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Gestión y seguimiento de pedidos"
        icon={<ShoppingCart className="h-5 w-5" />}
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[130px]">Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[120px]">Fecha</TableHead>
                  <TableHead className="text-right w-[80px]">Ver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className="font-semibold text-green-800 dark:text-emerald-200 bg-green-50 dark:bg-emerald-950 px-2 py-0.5 rounded text-xs tracking-wide">
                        {order.numero_pedido}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{order.usuario?.nombre} {order.usuario?.apellido}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user?.role?.nombre === "cliente" ? (
                        <Badge variant={statusVariant(order.estado)} className="px-2 py-0.5 text-xs font-medium">
                          {statusLabel(order.estado)}
                        </Badge>
                      ) : (
                        <Select
                          defaultValue={order.estado}
                          onValueChange={(v) => updateStatus(order.id, v)}
                        >
                          <SelectTrigger className="h-8 w-[155px] text-xs">
                            <SelectValue>
                              <Badge variant={statusVariant(order.estado)} className="font-normal text-xs">
                                {statusLabel(order.estado)}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusVariant(order.estado_pago)} className="px-2 py-0.5 text-xs font-medium gap-1">
                        {order.estado_pago === "aprobado" && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/60" />
                        )}
                        {order.estado_pago}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-900 dark:text-emerald-200">
                      {formatCurrency(Number(order.total))}
                    </TableCell>
                    <TableCell className="text-muted-foreground dark:text-zinc-400 text-xs">
                      {order.created_at ? formatDate(order.created_at) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-700 dark:hover:text-emerald-300 hover:bg-green-50 dark:hover:bg-emerald-950"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
