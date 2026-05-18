import { useAuth } from "@/auth/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Bell, User, ChevronRight, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";
import { useCartCount, useCartUIStore } from "@/store/cartStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const totalItems = useCartCount();
  const openCart = useCartUIStore((s) => s.openCart);
  const [notifOpen, setNotifOpen] = useState(false);

  const canCreateOrders = user?.permissions?.includes("pedidos:create") ?? false;

  const initials = user
    ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase()
    : "??";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const roleLabel =
    user?.role?.nombre === "administrador"
      ? "Administrador"
      : user?.role?.nombre === "farmaceuta"
        ? "Farmaceuta"
        : user?.role?.nombre === "domiciliario"
          ? "Domiciliario"
          : "Cliente";

  return (
    <header className="h-16 border-b bg-card dark:bg-zinc-900 flex items-center justify-between px-6 shrink-0 transition-colors">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hover:bg-accent dark:hover:bg-zinc-800 text-muted-foreground dark:text-zinc-400"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-400">Inicio</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 dark:text-zinc-400/40" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400">
            {roleLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <AnimatedThemeToggler className="text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-100" />

        {canCreateOrders && (
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent dark:hover:bg-zinc-800 text-muted-foreground dark:text-zinc-400"
            onClick={() => openCart()}
            title="Carrito"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary dark:bg-emerald-600 text-primary-foreground dark:text-emerald-100 text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        )}

        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-accent dark:hover:bg-zinc-800 text-muted-foreground dark:text-zinc-400"
              title="Notificaciones"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive ring-2 ring-card dark:ring-zinc-900" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-0">
            <div className="px-4 py-3 border-b dark:border-zinc-800">
              <p className="text-sm font-semibold">Notificaciones</p>
            </div>
            <div className="px-4 py-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground dark:text-zinc-400">
                No tienes notificaciones
              </p>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2.5 px-2 py-1.5 ml-1 hover:bg-accent dark:hover:bg-zinc-800 rounded-lg">
              <div className="relative">
                <Avatar className="h-8 w-8 ring-2 ring-border dark:ring-zinc-800">
                  <AvatarFallback className="text-xs bg-primary dark:bg-emerald-600 text-primary-foreground dark:text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success dark:bg-emerald-600 ring-2 ring-card dark:ring-zinc-900" />
              </div>
              <span className="text-sm font-medium hidden md:inline text-foreground dark:text-zinc-100">
                {user?.nombre}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64 mt-2 overflow-hidden rounded-xl shadow-lg dark:shadow-black/30">
            <div className="px-4 py-3.5 bg-gradient-to-br from-primary/5 dark:from-emerald-500/5 to-card dark:to-zinc-900 border-b">
              <p className="text-sm font-semibold">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-0.5 truncate">{user?.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-success dark:bg-emerald-600" />
                  {roleLabel}
                </span>
              </div>
            </div>
            <div className="py-1.5">
              <DropdownMenuItem
                onClick={() => navigate("/app/profile")}
                className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <div className="py-1.5">
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
