import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import type { RoleName } from "@/types";

interface RoleGuardProps {
  allowedRoles: RoleName[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const roleName = user.role?.nombre as RoleName;
  if (!allowedRoles.includes(roleName)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
