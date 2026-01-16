import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">(
    "loading"
  );

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include"
        });

        const data = (await response.json()) as { session?: unknown } | null;

        if (!isMounted) {
          return;
        }

        if (response.ok && data && typeof data === "object" && "session" in data && data.session) {
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      } catch {
        if (isMounted) {
          setStatus("unauthenticated");
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "loading") {
    return <div className="auth-loading">Checking session...</div>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/auth/sign-in" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
