import { catalogService } from "@/api/services/catalog.service";
import { useFetchList } from "@/hooks/useFetchList";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TicketPercent } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Coupon } from "@/types";

const tipoVariant = (tipo: Coupon["tipo_descuento"]): "default" | "secondary" | "success" => {
  const map: Record<Coupon["tipo_descuento"], "default" | "secondary" | "success"> = {
    porcentaje: "default",
    valor_fijo: "secondary",
    envio_gratis: "success",
  };
  return map[tipo] ?? "default";
};

const tipoLabel = (tipo: Coupon["tipo_descuento"]): string => {
  const map: Record<Coupon["tipo_descuento"], string> = {
    porcentaje: "Porcentaje",
    valor_fijo: "Valor fijo",
    envio_gratis: "Envío gratis",
  };
  return map[tipo] ?? tipo;
};

const formatCouponValue = (cupon: Coupon): string => {
  if (cupon.tipo_descuento === "porcentaje") return `${cupon.valor_descuento}%`;
  return formatCurrency(cupon.valor_descuento);
};

export function CouponsPage() {
  const { data: coupons, loading } = useFetchList<Coupon>(
    () => catalogService.cupones(),
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cupones"
        description="Listado de cupones de descuento disponibles"
        icon={<TicketPercent className="h-5 w-5" />}
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : coupons.length === 0 ? (
            <EmptyState
              icon="box"
              title="Sin cupones disponibles"
              description="No hay cupones registrados en este momento"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((cupon) => (
                  <TableRow key={cupon.id}>
                    <TableCell className="font-medium font-mono">{cupon.codigo}</TableCell>
                    <TableCell>{cupon.descripcion || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={tipoVariant(cupon.tipo_descuento)}>{tipoLabel(cupon.tipo_descuento)}</Badge>
                    </TableCell>
                    <TableCell>{formatCouponValue(cupon)}</TableCell>
                    <TableCell>
                      {cupon.usos_actuales}
                      {cupon.max_usos_total ? ` / ${cupon.max_usos_total}` : ""}
                    </TableCell>
                    <TableCell className="text-muted-foreground dark:text-zinc-400">{formatDate(cupon.fecha_inicio)}</TableCell>
                    <TableCell className="text-muted-foreground dark:text-zinc-400">{formatDate(cupon.fecha_fin)}</TableCell>
                    <TableCell>
                      <Badge variant={cupon.activo ? "success" : "destructive"}>
                        {cupon.activo ? "Activo" : "Inactivo"}
                      </Badge>
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
