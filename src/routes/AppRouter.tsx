import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "@/layouts/AdminLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleGuard } from "@/routes/RoleGuard";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { StorefrontPage } from "@/features/store/StorefrontPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { CatalogPage } from "@/features/catalog/CatalogPage";
import { MedicineDetailPage } from "@/features/catalog/MedicineDetailPage";
import { UsersPage } from "@/features/users/UsersPage";
import { MedicinesPage } from "@/features/medicines/MedicinesPage";
import { InventoryPage } from "@/features/inventory/InventoryPage";
import { OrdersPage } from "@/features/orders/OrdersPage";
import { OrderDetailPage } from "@/features/orders/OrderDetailPage";
import { NewOrderPage } from "@/features/orders/NewOrderPage";
import { FormulasPage } from "@/features/formulas/FormulasPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { AddressesPage } from "@/features/addresses/AddressesPage";
import { CouponsPage } from "@/features/coupons/CouponsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <StorefrontPage /> },
      { path: "products/:id", element: <MedicineDetailPage /> },
      { path: "*", element: <StorefrontPage /> },
    ],
  },
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "catalog", element: <CatalogPage /> },
          { path: "catalog/:id", element: <MedicineDetailPage /> },
          {
            element: <RoleGuard allowedRoles={["administrador"]} />,
            children: [{ path: "users", element: <UsersPage /> }],
          },
          {
            element: <RoleGuard allowedRoles={["administrador", "farmaceuta"]} />,
            children: [
              { path: "medicines", element: <MedicinesPage /> },
              { path: "inventory", element: <InventoryPage /> },
            ],
          },
          {
            element: <RoleGuard allowedRoles={["administrador", "farmaceuta", "domiciliario", "cliente"]} />,
            children: [
              { path: "orders", element: <OrdersPage /> },
              { path: "orders/:id", element: <OrderDetailPage /> },
            ],
          },
          {
            element: <RoleGuard allowedRoles={["administrador", "cliente"]} />,
            children: [
              { path: "orders/new", element: <NewOrderPage /> },
            ],
          },
          {
            element: <RoleGuard allowedRoles={["administrador", "farmaceuta", "cliente"]} />,
            children: [
              { path: "formulas", element: <FormulasPage /> },
              { path: "addresses", element: <AddressesPage /> },
            ],
          },
          {
            element: <RoleGuard allowedRoles={["administrador", "farmaceuta"]} />,
            children: [
              { path: "coupons", element: <CouponsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "/dashboard", element: <Navigate to="/app/dashboard" replace /> },
  { path: "/catalog", element: <Navigate to="/app/catalog" replace /> },
  { path: "/orders", element: <Navigate to="/app/orders" replace /> },
]);
