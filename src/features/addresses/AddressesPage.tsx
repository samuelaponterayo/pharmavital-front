import { useState, useEffect } from "react";
import { addressesService } from "@/api/services/addresses.service";
import { catalogService } from "@/api/services/catalog.service";
import { addressSchema, type AddressFormData } from "@/schemas/addresses.schema";
import { useAuth } from "@/auth/AuthContext";
import { useFetchList } from "@/hooks/useFetchList";
import { useMutation } from "@/hooks/useMutation";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { Field } from "@/components/Field";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Address, Barrio } from "@/types";

export function AddressesPage() {
  const { user, hasPermission } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [barrios, setBarrios] = useState<Barrio[]>([]);

  const isCliente = user?.role?.nombre === "cliente";
  const canCreate = hasPermission("direcciones:create");
  const canUpdate = hasPermission("direcciones:update");
  const canDelete = hasPermission("direcciones:delete");

  const { data: addresses, loading, refresh } = useFetchList<Address>(
    () => addressesService.list(isCliente ? { user_id: user!.id } : undefined),
    [user]
  );

  useEffect(() => {
    const loadBarrios = async () => {
      try {
        const res = await catalogService.barrios();
        setBarrios(res.data ?? []);
      } catch {
        // silently fail, Select will be empty
      }
    };
    loadBarrios();
  }, []);

  const { mutate: saveAddress, loading: saving } = useMutation(
    async (data: AddressFormData) => {
      if (editingAddress) {
        const { usuario_id, ...updateData } = data;
        return addressesService.update(editingAddress.id, updateData);
      }
      return addressesService.create(data);
    },
    {
      successMsg: editingAddress ? "Dirección actualizada" : "Dirección creada",
      onSuccess: () => {
        setDialogOpen(false);
        setEditingAddress(null);
        refresh();
      },
    }
  );

  const { mutate: deleteAddress, loading: deleting } = useMutation(
    (address: Address) => addressesService.remove(address.id),
    {
      successMsg: "Dirección eliminada",
      onSuccess: () => {
        setDeleteTarget(null);
        refresh();
      },
    }
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema) as any,
    defaultValues: {
      usuario_id: user?.id ?? "",
    },
  });

  useEffect(() => {
    if (editingAddress) {
      reset({
        usuario_id: editingAddress.usuario_id,
        barrio_id: editingAddress.barrio_id,
        direccion: editingAddress.direccion,
        complemento: editingAddress.complemento ?? "",
        referencia: editingAddress.referencia ?? "",
        alias: editingAddress.alias ?? "",
        es_principal: editingAddress.es_principal,
      });
    } else {
      reset({ usuario_id: user?.id ?? "" });
    }
  }, [editingAddress, reset, user?.id]);

  const getBarrioName = (barrioId: string) => barrios.find((b) => b.id === barrioId)?.nombre ?? "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Direcciones"
        description="Gestión de direcciones de envío"
        icon={<MapPin className="h-5 w-5" />}
      >
        {canCreate && (
          <Button onClick={() => { setEditingAddress(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Dirección
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : addresses.length === 0 ? (
            <EmptyState
              icon="box"
              title="Sin direcciones registradas"
              description="Agrega tu primera dirección de envío"
              action={canCreate ? { label: "Nueva Dirección", onClick: () => { setEditingAddress(null); setDialogOpen(true); } } : undefined}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barrio</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Complemento</TableHead>
                  <TableHead>Alias</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addresses.map((addr) => (
                  <TableRow key={addr.id}>
                    <TableCell className="font-medium">{getBarrioName(addr.barrio_id)}</TableCell>
                    <TableCell>{addr.direccion}</TableCell>
                    <TableCell className="text-muted-foreground dark:text-zinc-400">{addr.complemento || "—"}</TableCell>
                    <TableCell>{addr.alias || "—"}</TableCell>
                    <TableCell>
                      {addr.es_principal ? (
                        <Badge variant="success">Principal</Badge>
                      ) : (
                        <Badge variant="secondary">Secundaria</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {(canUpdate || canDelete) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canUpdate && (
                              <>
                                <DropdownMenuItem onClick={() => { setEditingAddress(addr); setDialogOpen(true); }}>
                                  <Pencil className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {canDelete && (
                              <DropdownMenuItem onClick={() => setDeleteTarget(addr)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Editar Dirección" : "Nueva Dirección"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(saveAddress)} className="space-y-4">
            <input type="hidden" {...register("usuario_id")} />
            <Field label="Barrio" error={errors.barrio_id?.message}>
              <Controller
                control={control}
                name="barrio_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar barrio..." />
                    </SelectTrigger>
                    <SelectContent>
                      {barrios.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Dirección" error={errors.direccion?.message}>
              <Input {...register("direccion")} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Complemento" error={errors.complemento?.message}>
                <Input {...register("complemento")} />
              </Field>
              <Field label="Alias" error={errors.alias?.message}>
                <Input {...register("alias")} />
              </Field>
            </div>
            <Field label="Referencia" error={errors.referencia?.message}>
              <Input {...register("referencia")} />
            </Field>
            <Field label="¿Es dirección principal?">
              <Controller
                control={control}
                name="es_principal"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="es_principal"
                    />
                    <label htmlFor="es_principal" className="text-sm text-muted-foreground dark:text-zinc-400 cursor-pointer">
                      Marcar como dirección principal
                    </label>
                  </div>
                )}
              />
            </Field>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Eliminar dirección"
        description={`¿Eliminar la dirección "${deleteTarget?.direccion}"?`}
        onConfirm={() => { if (deleteTarget) deleteAddress(deleteTarget); }}
        loading={deleting}
      />
    </div>
  );
}
