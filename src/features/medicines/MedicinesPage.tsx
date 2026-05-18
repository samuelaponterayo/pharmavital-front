import { useState, useEffect, useRef } from "react";
import { medicinesService } from "@/api/services/medicines.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchList } from "@/hooks/useSearchList";
import { useMutation } from "@/hooks/useMutation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Search, Plus, Pill, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/utils/formatters";
import type { Medicine } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MedicineFormData } from "@/schemas/medicines.schema";
import { toast } from "sonner";
import { MedicineForm } from "./MedicineForm";
import { PageHeader } from "@/components/PageHeader";

export function MedicinesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null);
  const editingRef = useRef<Medicine | null>(null);

  useEffect(() => {
    editingRef.current = editingMedicine;
  }, [editingMedicine]);

  const { data: medicines, loading, search, setSearch, refresh } = useSearchList<Medicine>(
    async (search) => {
      const res = await medicinesService.list({ search: search || undefined });
      return res.data ?? [];
    },
  );

  const { mutate: save, loading: saving } = useMutation(
    async (data: MedicineFormData) => {
      const current = editingRef.current;
      if (current) {
        await medicinesService.update(current.id, data);
      } else {
        await medicinesService.create(data);
      }
    },
    {
      onSuccess: () => {
        toast.success(editingRef.current ? "Medicamento actualizado" : "Medicamento creado");
        setDialogOpen(false);
        setEditingMedicine(null);
        refresh();
      },
    }
  );

  const { mutate: remove, loading: deleting } = useMutation(
    async (id: string) => {
      await medicinesService.remove(id);
    },
    {
      successMsg: "Medicamento eliminado",
      onSuccess: () => {
        setConfirmOpen(false);
        setDeleteTarget(null);
        refresh();
      },
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Medicamentos" description="Gestión del catálogo de medicamentos" icon={<Pill className="h-5 w-5" />}>
        <Button onClick={() => { setEditingMedicine(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Medicamento
        </Button>
      </PageHeader>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-zinc-400" />
        <Input placeholder="Buscar medicamento..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Genérico</TableHead>
                  <TableHead>INVIMA</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio base</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.nombre_comercial}</TableCell>
                    <TableCell className="text-muted-foreground dark:text-zinc-400">{m.nombre_generico}</TableCell>
                    <TableCell>{m.registro_invima}</TableCell>
                    <TableCell>{m.categoria?.nombre ?? "—"}</TableCell>
                    <TableCell>
                      {m.inventarios?.length ? formatCurrency(Number(m.inventarios[0].precio_venta)) : "—"}
                    </TableCell>
                    <TableCell>
                      {m.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingMedicine(m); setDialogOpen(true); }}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setDeleteTarget(m); setConfirmOpen(true); }} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMedicine ? "Editar Medicamento" : "Nuevo Medicamento"}</DialogTitle>
          </DialogHeader>
          <MedicineForm medicine={editingMedicine ?? undefined} onSave={save} saving={saving} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar medicamento"
        description={`¿Eliminar ${deleteTarget?.nombre_comercial ?? "este medicamento"}?`}
        onConfirm={() => {
          if (deleteTarget) remove(deleteTarget.id);
        }}
        loading={deleting}
      />
    </div>
  );
}
