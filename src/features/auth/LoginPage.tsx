import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { useAuth } from "@/auth/AuthContext";
import { useMutation } from "@/hooks/useMutation";
import { LoadingPage } from "@/components/LoadingPage";
import { Field } from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Loader2, Plus } from "lucide-react";

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: doLogin, loading } = useMutation(
    async (data: LoginFormData) => {
      await login(data.email, data.password);
    },
    {
      onSuccess: () => {
        const from = (location.state as LocationState)?.from || "/app/dashboard";
        navigate(from, { replace: true });
      },
    }
  );

  if (isLoading) return <LoadingPage />;

  if (isAuthenticated) {
    const from = (location.state as LocationState)?.from || "/app/dashboard";
    navigate(from, { replace: true });
    return <LoadingPage />;
  }

  return (
    <>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* Branding Panel */}
        <div className="health-gradient flex flex-col items-center justify-center px-6 py-16 lg:w-1/2 lg:p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-28 -left-20 w-80 h-80 rounded-full bg-white/5" />
            <div className="absolute top-1/2 -right-40 w-[26rem] h-[26rem] rounded-full bg-white/[0.03]" />
            <div className="absolute -bottom-20 left-1/3 w-64 h-64 rounded-full bg-white/5" />
          </div>

          <div
            className="relative z-10 flex flex-col items-center text-center w-full"
            style={{ animation: "fadeInUp 0.7s ease-out forwards" }}
          >
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm shadow-lg shadow-black/10">
              <Plus className="h-10 w-10" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">PharmaVital</h1>
            <p className="mt-3 text-lg text-white/70 font-light tracking-wide">
              Tu farmacia virtual de confianza
            </p>
            <div className="mt-14 flex gap-4 items-center justify-center opacity-30">
              <Pill className="h-6 w-6" />
              <div className="w-0.5 h-0.5 rounded-full bg-white/50" />
              <Plus className="h-5 w-5" />
              <div className="w-0.5 h-0.5 rounded-full bg-white/50" />
              <Pill className="h-6 w-6" />
            </div>
          </div>

          <p className="mt-auto pt-8 text-sm text-white/25 tracking-wider relative z-10">
            Sistema de gestión farmacéutica
          </p>
        </div>

        {/* Login Panel */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 health-gradient-light dark:bg-zinc-900">
          <Card
            className="w-full max-w-md border-border/50 bg-card/75 backdrop-blur-xl shadow-xl shadow-primary/5 dark:shadow-primary/10 dark:bg-zinc-900/75 dark:border-zinc-700/50 dark:text-zinc-100"
            style={{ animation: "fadeInUp 0.7s ease-out 0.15s forwards", opacity: 0 }}
          >
            <CardHeader className="text-center space-y-4 pb-2">
              <div className="mx-auto bg-primary/10 dark:bg-emerald-500/10 p-3 rounded-xl w-fit">
                <Pill className="h-8 w-8 text-primary dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
                <CardDescription className="mt-1.5">
                  Ingresa tus credenciales para continuar
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit((data) => doLogin(data))} className="space-y-4">
                <Field label="Email" error={errors.email?.message}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@farmacia.com"
                    autoComplete="email"
                    {...register("email")}
                  />
                </Field>

                <Field label="Contraseña" error={errors.password?.message}>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                  />
                </Field>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Iniciar sesión
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground dark:text-zinc-400 mt-6">
                admin@farmacia.com / Admin12345!
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </>
  );
}
