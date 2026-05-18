import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import {
  LayoutDashboard,
  PillBottle,
  Package,
  ShoppingCart,
  ShoppingBag,
  FileText,
  Users,
  Settings,
  MapPin,
  TicketPercent,
  ChevronLeft,
  HeartPulse,
} from "lucide-react";
import type { RoleName } from "@/types";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  roleName: RoleName;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: RoleName[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard, roles: ["administrador", "farmaceuta"] },
  { label: "Catálogo", href: "/app/catalog", icon: ShoppingBag, roles: ["cliente", "administrador", "farmaceuta", "domiciliario"] },
  { label: "Medicamentos", href: "/app/medicines", icon: PillBottle, roles: ["administrador", "farmaceuta"] },
  { label: "Inventario", href: "/app/inventory", icon: Package, roles: ["administrador", "farmaceuta"] },
  { label: "Pedidos", href: "/app/orders", icon: ShoppingCart, roles: ["administrador", "farmaceuta", "domiciliario", "cliente"] },
  { label: "Fórmulas", href: "/app/formulas", icon: FileText, roles: ["administrador", "farmaceuta", "cliente"] },
  { label: "Direcciones", href: "/app/addresses", icon: MapPin, roles: ["administrador", "cliente"] },
  { label: "Cupones", href: "/app/coupons", icon: TicketPercent, roles: ["administrador", "farmaceuta"] },
  { label: "Usuarios", href: "/app/users", icon: Users, roles: ["administrador"] },
];

export function Sidebar({ isOpen, onToggle, roleName }: SidebarProps) {
  const filtered = NAV_ITEMS.filter((item) => item.roles.includes(roleName));

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 shadow-sm dark:shadow-black/30 transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-[72px]"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className={cn("flex items-center gap-3 min-w-0", isOpen ? "flex-1" : "justify-center")}>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-success/90 dark:bg-emerald-600/90 flex-shrink-0">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <span
            className={cn(
              "font-bold text-base text-gray-800 dark:text-zinc-200 whitespace-nowrap transition-opacity duration-200",
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
            )}
          >
            PharmaVital
          </span>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-all duration-200 flex-shrink-0",
            !isOpen && "mx-auto absolute left-1/2 -translate-x-1/2"
          )}
          style={!isOpen ? undefined : undefined}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform duration-300", !isOpen && "rotate-180")}
          />
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {filtered.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-success dark:bg-emerald-600 text-white shadow-sm dark:shadow-black/30"
                  : "text-gray-600 dark:text-zinc-300 hover:bg-green-50 dark:hover:bg-emerald-950 hover:text-green-700 dark:hover:text-emerald-200",
                !isOpen && "justify-center px-0"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200", isActive && "scale-110")} />
                {isOpen && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {isActive && isOpen && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 flex-shrink-0" />
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-green-600 dark:bg-emerald-600" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 dark:border-zinc-800 p-3">
            <NavLink
              to="/app/profile"
              className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
              isActive
                ? "bg-success dark:bg-emerald-600 text-white shadow-sm dark:shadow-black/30"
                : "text-gray-600 dark:text-zinc-300 hover:bg-green-50 dark:hover:bg-emerald-950 hover:text-green-700 dark:hover:text-emerald-200",
              !isOpen && "justify-center px-0"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings className="h-5 w-5 shrink-0" />
              {isOpen && <span>Perfil</span>}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-green-600 dark:bg-emerald-600" />
              )}
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
