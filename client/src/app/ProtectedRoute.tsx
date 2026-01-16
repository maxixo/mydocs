import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

const isAuthenticated = () => {
  // TODO: Replace with real auth state (session, cookie, or Firebase token exchange).
  return Boolean(localStorage.getItem("auth_token"));
};

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
