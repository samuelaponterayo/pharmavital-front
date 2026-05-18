import { useState } from "react";
import { inventoryService } from "@/api/services/inventory.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, PackageSearch, MoreHorizontal, Pencil, ArrowDownUp, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, daysUntil } from "@/utils/formatters";
import type { Inventory } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFetchList } from "@/hooks/useFetchList";
import { useMutation } from "@/hooks/useMutation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { InventoryForm } from "./InventoryForm";
import { MoveStockForm } from "./MoveStockForm";
import type { InventoryFormData, MoveStockFormData } from "@/schemas/inventory.schema";
import { PageHeader } from "@/components/PageHeader";

export function InventoryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Inventory | null>(null);

  const { data: items, loading, refresh } = useFetchList<Inventory>(
    () => inventoryService.list(),
    []
  );

  const { mutate: saveItem, loading: saving } = useMutation(
    async (data: InventoryFormData) => {
      if (editingItem) {
        return inventoryService.update(editingItem.id, data);
      }
      return inventoryService.create(data);
    },
    {
      successMsg: editingItem ? "Inventario actualizado" : "Inventario creado",
      onSuccess: () => {
        setDialogOpen(false);
        setEditingItem(null);
        refresh();
      },
    }
  );

  const { mutate: moveStock, loading: moving } = useMutation(
    async (data: MoveStockFormData) => {
      if (!selectedItem) throw new Error("No item selected");
      return inventoryService.moveStock(selectedItem.id, data.tipo, data.cantidad, data.motivo || "");
    },
    {
      successMsg: "Movimiento registrado",
      onSuccess: () => {
        setMoveDialogOpen(false);
        refresh();
      },
    }
  );

  const { mutate: deleteItem, loading: deleting } = useMutation(
    (item: Inventory) => inventoryService.remove(item.id),
    {
      successMsg: "Inventario eliminado",
      onSuccess: () => {
        setDeleteTarget(null);
        refresh();
      },
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Inventario" description="Gestión de stock y lotes" icon={<PackageSearch className="h-5 w-5" />}>
        <Button onClick={() => { setEditingItem(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Lote
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Items</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{items.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Stock Bajo</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">
              {items.filter((i) => Number(i.stock_disponible) <= Number(i.stock_minimo)).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Por Vencer (&lt;30 días)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {items.filter((i) => daysUntil(i.fecha_vencimiento) <= 30).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Precio Venta</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const remaining = daysUntil(item.fecha_vencimiento);
                  const lowStock = Number(item.stock_disponible) <= Number(item.stock_minimo);
                  const expiring = remaining <= 30;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.medicamento?.nombre_comercial ?? "—"}</TableCell>
                      <TableCell>{item.lote}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={lowStock ? "text-amber-500 dark:text-amber-400 font-bold" : ""}>{String(item.stock_disponible)}</span>
                          {lowStock && <Badge variant="warning">Bajo</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(Number(item.precio_venta))}</TableCell>
                      <TableCell>
                        <span className={expiring ? "text-red-500" : ""}>
                          {item.fecha_vencimiento} {expiring && `(${remaining}d)`}
                        </span>
                      </TableCell>
                      <TableCell>{item.ubicacion_bodega ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedItem(item); setMoveDialogOpen(true); }}>
                              <ArrowDownUp className="mr-2 h-4 w-4" /> Mover Stock
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setEditingItem(item); setDialogOpen(true); }}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeleteTarget(item)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editingItem ? "Editar Lote" : "Nuevo Lote"}</DialogTitle></DialogHeader>
          <InventoryForm item={editingItem ?? undefined} onSave={saveItem} saving={saving} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Movimiento de Stock</DialogTitle>
            <p className="text-sm text-muted-foreground dark:text-zinc-400">Lote: {selectedItem?.lote}</p>
          </DialogHeader>
          <MoveStockForm saving={moving} onSave={moveStock} onCancel={() => setMoveDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Eliminar inventario"
        description={`¿Eliminar inventario del lote ${deleteTarget?.lote}?`}
        onConfirm={() => { if (deleteTarget) deleteItem(deleteTarget); }}
        loading={deleting}
      />
    </div>
  );
}
