import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { useCartUIStore } from "@/store/cartStore";
import { useAuth } from "@/auth/AuthContext";
import { LoadingPage } from "@/components/LoadingPage";
import type { RoleName } from "@/types";

function CartDrawerWrapper() {
  const cartOpen = useCartUIStore((s) => s.cartOpen);
  const closeCart = useCartUIStore((s) => s.closeCart);
  return <CartDrawer open={cartOpen} onClose={closeCart} />;
}

export function AdminLayout() {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) return <LoadingPage />;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-800">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        roleName={(user?.role?.nombre as RoleName) ?? "cliente"}
      />
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-[72px]"
        }`}
      >
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-zinc-800/50">
          <Outlet />
        </main>
      </div>
      <CartDrawerWrapper />
    </div>
  );
}
