import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, type UserFormData } from "@/schemas/users.schema";
import { usersService } from "@/api/services/users.service";
import { authService } from "@/api/services/auth.service";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/Field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pill, Loader2, AlertCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { useMutation } from "@/hooks/useMutation";

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const from = (location.state as { from?: string; message?: string })?.from || "/dashboard";
  const message = (location.state as { from?: string; message?: string })?.message;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      roleName: "cliente",
      estado: "activo",
    },
  });

  const { mutate: doRegister, loading } = useMutation(
    async (data: UserFormData) => {
      setError("");
      const payload = { ...data };
      if (!payload.password) delete (payload as Record<string, unknown>).password;

      try {
        await usersService.create(payload as Required<UserFormData>);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al crear cuenta";
        if (msg.includes("401") || msg.includes("403")) {
          throw new Error(
            "El registro requiere autenticación previa. Contacta al administrador o intenta más tarde."
          );
        }
        throw err;
      }

      setRegisteredEmail(data.email);

      try {
        await authService.login(data.email, data.password || "Tempor@l123");
        navigate(from, { replace: true });
      } catch {
        // Login after register may fail if backend requires email verification
        // Stay on success state
      }
    },
    {
      onSuccess: () => {
        if (registeredEmail) {
          navigate("/login", {
            state: {
              from,
              email: registeredEmail,
              message: "Cuenta creada. Inicia sesión para continuar.",
            },
          });
        }
      },
    }
  );

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 dark:from-emerald-500/5 to-background dark:to-zinc-950">
      <div className="w-full max-w-lg">
        <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" /> Volver a la tienda
        </Button>

        <Card className="shadow-xl dark:shadow-black/30">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto bg-primary/10 dark:bg-emerald-500/10 p-3 rounded-xl w-fit">
              <Pill className="h-7 w-7 text-primary dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
              <CardDescription className="mt-1.5">
                Regístrate para comprar medicamentos y gestionar tus pedidos
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {message && (
              <Alert className="mb-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
                <ShoppingCart className="h-4 w-4" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit((data) => doRegister(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre" error={errors.nombre?.message}>
                  <Input placeholder="Tu nombre" {...register("nombre")} />
                </Field>
                <Field label="Apellido" error={errors.apellido?.message}>
                  <Input placeholder="Tu apellido" {...register("apellido")} />
                </Field>
              </div>

              <Field label="Email" error={errors.email?.message}>
                <Input type="email" placeholder="tu@email.com" autoComplete="email" {...register("email")} />
              </Field>

              <Field label="Teléfono" error={errors.telefono?.message}>
                <Input placeholder="3000000000" {...register("telefono")} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo Doc." error={errors.tipo_documento?.message}>
                  <Select
                    onValueChange={(v) => setValue("tipo_documento", v as "CC" | "CE" | "TI" | "PAS" | "NIT")}
                    defaultValue="CC"
                  >
                    <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">CC</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="TI">TI</SelectItem>
                      <SelectItem value="PAS">PAS</SelectItem>
                      <SelectItem value="NIT">NIT</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="N° Documento" error={errors.numero_documento?.message}>
                  <Input placeholder="1000000000" {...register("numero_documento")} />
                </Field>
              </div>

              <Field label="Contraseña" error={errors.password?.message}>
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  {...register("password")}
                />
              </Field>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear cuenta
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground dark:text-zinc-400 mt-6">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="text-primary dark:text-emerald-400 hover:underline font-medium"
              >
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
