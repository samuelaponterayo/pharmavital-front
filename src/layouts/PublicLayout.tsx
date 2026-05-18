import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";
import { useCartCount, useCartUIStore } from "@/store/cartStore";
import { CartDrawer } from "@/components/CartDrawer";
import { ShoppingCart, Pill, User, LogIn, Menu, X } from "lucide-react";

function CartDrawerWrapper() {
  const cartOpen = useCartUIStore((s) => s.cartOpen);
  const closeCart = useCartUIStore((s) => s.closeCart);
  return <CartDrawer open={cartOpen} onClose={closeCart} />;
}

export function PublicLayout() {
  const { isAuthenticated, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const totalItems = useCartCount();
  const openCart = useCartUIStore((s) => s.openCart);
  const canCreateOrders = hasPermission("pedidos:create");

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 font-bold text-lg text-primary dark:text-emerald-400 hover:opacity-80 transition-opacity"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary dark:bg-emerald-600 text-primary-foreground dark:text-emerald-100">
                <Pill className="h-5 w-5" />
              </span>
              PharmaVital
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-100 hover:bg-accent dark:hover:bg-zinc-800 transition-colors"
              >
                Tienda
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <AnimatedThemeToggler />

            {canCreateOrders && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => openCart()}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary dark:bg-emerald-600 text-primary-foreground dark:text-emerald-100 text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            )}

            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="hidden md:flex"
              >
                <User className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="hidden md:flex items-center gap-2"
                onClick={() => navigate("/login")}
              >
                <LogIn className="h-4 w-4" /> Iniciar sesión
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t dark:border-zinc-800 bg-card dark:bg-zinc-900 px-4 py-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent dark:hover:bg-zinc-800"
              onClick={() => setMobileMenu(false)}
            >
              Tienda
            </Link>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent dark:hover:bg-zinc-800"
                onClick={() => setMobileMenu(false)}
              >
                Mi cuenta
              </Link>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent dark:hover:bg-zinc-800"
                onClick={() => setMobileMenu(false)}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t dark:border-zinc-800 bg-card dark:bg-zinc-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg text-primary dark:text-emerald-400 mb-3">
                <Pill className="h-5 w-5" /> PharmaVital
              </div>
              <p className="text-sm text-muted-foreground dark:text-zinc-400">
                Tu farmacia virtual de confianza. Medicamentos a domicilio en Pereira.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Enlaces</h3>
              <ul className="space-y-2 text-sm text-muted-foreground dark:text-zinc-400">
                <li><Link to="/" className="hover:text-foreground dark:hover:text-zinc-100">Tienda</Link></li>
                <li><Link to="/login" className="hover:text-foreground dark:hover:text-zinc-100">Iniciar sesión</Link></li>
                <li><Link to="/register" className="hover:text-foreground dark:hover:text-zinc-100">Crear cuenta</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Contacto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground dark:text-zinc-400">
                <li>Pereira, Risaralda</li>
                <li>contacto@pharmavital.com</li>
                <li>Lun-Sáb: 8:00 - 20:00</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t dark:border-zinc-800 text-center text-xs text-muted-foreground dark:text-zinc-500">
            © {new Date().getFullYear()} PharmaVital. Sistema de gestión farmacéutica.
          </div>
        </div>
      </footer>

      <CartDrawerWrapper />
    </div>
  );
}
