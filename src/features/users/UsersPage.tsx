import { useState } from "react";
import { usersService } from "@/api/services/users.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchList } from "@/hooks/useSearchList";
import { useMutation } from "@/hooks/useMutation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/formatters";
import type { User } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import type { UserFormData } from "@/schemas/users.schema";
import { PageHeader } from "@/components/PageHeader";

export function UsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { data: users, loading, search, setSearch, refresh } = useSearchList<User>(
    (searchTerm: string) => usersService.list({ search: searchTerm || undefined }),
  );

  const { mutate: saveUser, loading: saving } = useMutation(
    async (data: UserFormData) => {
      const payload = { ...data };
      if (!payload.password) delete payload.password;

      if (editingUser) {
        return usersService.update(editingUser.id, payload);
      }
      return usersService.create(payload);
    },
    {
      successMsg: editingUser ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
      onSuccess: () => {
        setDialogOpen(false);
        setEditingUser(null);
        refresh();
      },
    }
  );

  const { mutate: deleteUser, loading: deleting } = useMutation(
    (user: User) => usersService.remove(user.id),
    {
      successMsg: "Usuario eliminado",
      onSuccess: () => {
        setDeleteTarget(null);
        refresh();
      },
    }
  );

  const stateVariant = (estado: string): "success" | "destructive" | "warning" => {
    if (estado === "activo") return "success";
    if (estado === "inactivo") return "destructive";
    return "warning";
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Usuarios" description="Gestión de usuarios del sistema" icon={<Users className="h-5 w-5" />}>
        <Button onClick={() => { setEditingUser(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
        </Button>
      </PageHeader>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-zinc-400" />
        <Input
          placeholder="Buscar por nombre, email, documento..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nombre} {user.apellido}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.tipo_documento} {user.numero_documento}</TableCell>
                    <TableCell>{user.role?.nombre ?? "—"}</TableCell>
                    <TableCell><Badge variant={stateVariant(user.estado)}>{user.estado}</Badge></TableCell>
                    <TableCell className="text-muted-foreground dark:text-zinc-400">{user.created_at ? formatDate(user.created_at) : "—"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingUser(user); setDialogOpen(true); }}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleteTarget(user)} className="text-destructive">
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
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          </DialogHeader>
          <UserForm
            user={editingUser ?? undefined}
            onSave={saveUser}
            saving={saving}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Eliminar usuario"
        description={`¿Eliminar a ${deleteTarget?.nombre} ${deleteTarget?.apellido}?`}
        onConfirm={() => { if (deleteTarget) deleteUser(deleteTarget); }}
        loading={deleting}
      />
    </div>
  );
}
