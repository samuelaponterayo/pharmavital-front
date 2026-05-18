import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, userUpdateSchema, type UserFormData } from "@/schemas/users.schema";
import { Field } from "@/components/Field";
import type { User } from "@/types";

interface UserFormProps {
  user?: User;
  onSave: (data: UserFormData) => Promise<void>;
  saving: boolean;
  onCancel: () => void;
}

export function UserForm({ user, onSave, saving, onCancel }: UserFormProps) {
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(isEditing ? userUpdateSchema : userSchema) as any,
    defaultValues: user
      ? {
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          telefono: user.telefono ?? "",
          tipo_documento: user.tipo_documento,
          numero_documento: user.numero_documento,
          fecha_nacimiento: user.fecha_nacimiento ?? "",
          roleName: (user.role?.nombre as "administrador" | "farmaceuta" | "domiciliario" | "cliente") ?? "cliente",
          estado: user.estado,
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre" error={errors.nombre?.message}>
          <Input {...register("nombre")} />
        </Field>
        <Field label="Apellido" error={errors.apellido?.message}>
          <Input {...register("apellido")} />
        </Field>
      </div>
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} />
      </Field>
      <Field label="Teléfono" error={errors.telefono?.message}>
        <Input {...register("telefono")} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Tipo Documento" error={errors.tipo_documento?.message}>
          <Select onValueChange={(v) => setValue("tipo_documento", v as "CC" | "CE" | "TI" | "PAS" | "NIT")} defaultValue={user?.tipo_documento ?? "CC"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CC">CC</SelectItem>
              <SelectItem value="CE">CE</SelectItem>
              <SelectItem value="TI">TI</SelectItem>
              <SelectItem value="PAS">PAS</SelectItem>
              <SelectItem value="NIT">NIT</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Número Documento" error={errors.numero_documento?.message}>
          <Input {...register("numero_documento")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Rol" error={errors.roleName?.message}>
          <Select onValueChange={(v) => setValue("roleName", v as "administrador" | "farmaceuta" | "domiciliario" | "cliente")} defaultValue={user?.role?.nombre ?? "cliente"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="administrador">Administrador</SelectItem>
              <SelectItem value="farmaceuta">Farmaceuta</SelectItem>
              <SelectItem value="domiciliario">Domiciliario</SelectItem>
              <SelectItem value="cliente">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Estado" error={errors.estado?.message}>
          <Select onValueChange={(v) => setValue("estado", v as "activo" | "inactivo" | "suspendido")} defaultValue={user?.estado ?? "activo"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
              <SelectItem value="suspendido">Suspendido</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Contraseña" error={errors.password?.message}>
        <Input type="password" placeholder={user ? "Dejar vacío para mantener" : "Mínimo 8 caracteres"} {...register("password")} />
      </Field>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
      </DialogFooter>
    </form>
  );
}
