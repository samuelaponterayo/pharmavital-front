import {
  UserCircle,
  Mail,
  Phone,
  FileText,
  Shield,
  Clock,
  Pencil,
  Check,
  X,
  Key,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { useMutation } from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/utils/formatters";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userUpdateSchema, type UserUpdateFormData } from "@/schemas/users.schema";
import { usersService } from "@/api/services/users.service";
import { PageHeader } from "@/components/PageHeader";

export function ProfilePage() {
  const { user, hasPermission } = useAuth();
  const [editing, setEditing] = useState(false);
  const canEdit = hasPermission("usuarios:update");

  if (!user) return null;

  const initials = `${user.nombre[0]}${user.apellido[0]}`.toUpperCase();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserUpdateFormData>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono ?? "",
    },
  });

  const { mutate: saveProfile, loading: saving } = useMutation(
    async (data: UserUpdateFormData) => {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== "" && v !== undefined)
      );
      await usersService.update(user.id, payload);
    },
    {
      successMsg: "Perfil actualizado correctamente",
      onSuccess: () => setEditing(false),
    }
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="Mi Perfil"
        description="Información personal y configuración"
        icon={<UserCircle className="h-5 w-5" />}
      />

      <div className="rounded-2xl border dark:border-zinc-800 bg-card dark:bg-zinc-900 overflow-hidden shadow-sm dark:shadow-black/20">
        <div className="h-28 bg-gradient-to-r from-primary/80 dark:from-emerald-700 to-primary dark:to-emerald-600" />

        <div className="px-6 pb-6 -mt-10 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 ring-4 ring-card dark:ring-zinc-900 shadow-lg">
                <AvatarFallback className="text-2xl font-bold bg-primary dark:bg-emerald-600 text-primary-foreground dark:text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1.5">
                <h2 className="text-xl font-bold text-foreground dark:text-zinc-100">
                  {user.nombre} {user.apellido}
                </h2>
                <p className="text-sm text-muted-foreground dark:text-zinc-400">{user.email}</p>
              </div>
            </div>

            {canEdit && (
              <Button
                variant={editing ? "ghost" : "outline"}
                size="sm"
                className="gap-2 rounded-xl self-start sm:self-end"
                onClick={() => setEditing(!editing)}
              >
                {editing ? (
                  <>
                    <X className="h-4 w-4" /> Cancelar edición
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" /> Editar perfil
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit((data) => saveProfile(data))} className="px-6 pb-8">
          <div className="border-t dark:border-zinc-800 pt-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 dark:bg-emerald-500/10">
                <UserCircle className="h-3.5 w-3.5 text-primary dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold">Información personal</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoOrInput
                label="Nombre"
                value={user.nombre}
                editing={editing}
                error={errors.nombre?.message}
                icon={UserCircle}
              >
                <Input {...register("nombre")} />
              </InfoOrInput>

              <InfoOrInput
                label="Apellido"
                value={user.apellido}
                editing={editing}
                error={errors.apellido?.message}
                icon={UserCircle}
              >
                <Input {...register("apellido")} />
              </InfoOrInput>

              <InfoOrInput
                label="Email"
                value={user.email}
                editing={editing}
                error={errors.email?.message}
                icon={Mail}
              >
                <Input type="email" {...register("email")} />
              </InfoOrInput>

              <InfoOrInput
                label="Teléfono"
                value={user.telefono ?? "No registrado"}
                editing={editing}
                icon={Phone}
              >
                <Input {...register("telefono")} />
              </InfoOrInput>

              <InfoOrInput
                label="Documento"
                value={`${user.tipo_documento} ${user.numero_documento}`}
                editing={false}
                icon={FileText}
              />

              <InfoOrInput
                label="Estado"
                value={user.estado}
                editing={false}
                icon={Shield}
              />
            </div>
          </div>

          <div className="border-t dark:border-zinc-800 mt-6 pt-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 dark:bg-emerald-500/10">
                <Key className="h-3.5 w-3.5 text-primary dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold">Seguridad</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoOrInput
                label="Email verificado"
                value={user.email_verificado ? "Sí" : "No"}
                editing={false}
                icon={Shield}
              />

              <InfoOrInput
                label="Último acceso"
                value={user.ultimo_acceso ? formatDate(user.ultimo_acceso) : "—"}
                editing={false}
                icon={Clock}
              />

              {editing && (
                <InfoOrInput
                  label="Nueva contraseña"
                  value="••••••••"
                  editing={true}
                  error={errors.password?.message}
                  icon={Key}
                >
                  <Input
                    type="password"
                    placeholder="Dejar vacío para no cambiar"
                    {...register("password")}
                  />
                </InfoOrInput>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t dark:border-zinc-800">
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="gap-2">
                <Check className="h-4 w-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function InfoOrInput({
  label,
  value,
  editing,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  value: string;
  editing: boolean;
  icon: React.ElementType;
  error?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
        editing && children
          ? "bg-primary/5 dark:bg-emerald-500/5 ring-1 ring-primary/20 dark:ring-emerald-600/20"
          : "bg-muted/30 dark:bg-zinc-800/30"
      }`}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-background dark:bg-zinc-900 border dark:border-zinc-700 shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground dark:text-zinc-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground dark:text-zinc-500 font-medium">
          {label}
        </p>
        {editing && children ? (
          <div className="mt-1">
            {children}
            {error && <p className="text-xs text-destructive dark:text-red-400 mt-1">{error}</p>}
          </div>
        ) : (
          <p className="text-sm font-medium text-foreground dark:text-zinc-200 mt-0.5 truncate">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
