import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  refresh: () => Promise<void>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getJwtHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("auth_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

type SessionUserPayload = {
  id?: unknown;
  email?: unknown;
  name?: unknown;
  image?: unknown;
};

type SessionPayload = {
  session?: {
    userId?: unknown;
    user?: SessionUserPayload;
  };
  user?: SessionUserPayload;
  data?: {
    user?: SessionUserPayload;
    session?: {
      userId?: unknown;
      user?: SessionUserPayload;
    };
  };
};

const toOptionalString = (value: unknown) =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const parseSessionUser = (payload: unknown): AuthUser | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as SessionPayload;
  const userData =
    data.user ??
    data.session?.user ??
    data.data?.user ??
    data.data?.session?.user ??
    null;

  const userId =
    toOptionalString(userData?.id) ??
    toOptionalString(data.session?.userId) ??
    toOptionalString(data.data?.session?.userId);

  if (!userId) {
    return null;
  }

  return {
    id: userId,
    email: toOptionalString(userData?.email),
    name: toOptionalString(userData?.name),
    image: toOptionalString(userData?.image)
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async () => {
    setStatus((prev) => (prev === "authenticated" ? prev : "loading"));

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: getJwtHeaders()
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      const nextUser = parseSessionUser(payload);
      if (!nextUser) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      setUser(nextUser);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      status,
      user,
      refresh
    }),
    [status, user, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
