import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserRole =
  | "Super Admin"
  | "Admin"
  | "Officer/Viewer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  designation?: string;
  lastLogin?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  hasRole: (
    ...roles: UserRole[]
  ) => boolean;
}

const API =
  import.meta.env.VITE_API_URL ||
  "https://police-hq-management-backend.onrender.com/api";

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] =
    useState<string | null>(
      () =>
        localStorage.getItem(
          "phq_auth_token"
        )
    );

  const [user, setUser] =
    useState<AuthUser | null>(
      () => {
        const raw =
          localStorage.getItem(
            "phq_auth_user"
          );

        try {
          return raw
            ? JSON.parse(raw)
            : null;
        } catch {
          return null;
        }
      }
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function validate() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await fetch(
            `${API}/auth/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            "Session expired"
          );
        }

        const result =
          await response.json();

        if (result.data) {
          setUser(
            result.data
          );

          localStorage.setItem(
            "phq_auth_user",
            JSON.stringify(
              result.data
            )
          );
        }
      } catch {
        localStorage.removeItem(
          "phq_auth_token"
        );

        localStorage.removeItem(
          "phq_auth_user"
        );

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void validate();
  }, [token]);

  const login = async (
    email: string,
    password: string
  ) => {
    const response =
      await fetch(
        `${API}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
          "Login failed"
      );
    }

    localStorage.setItem(
      "phq_auth_token",
      result.token
    );

    localStorage.setItem(
      "phq_auth_user",
      JSON.stringify(
        result.user
      )
    );

    setToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem(
      "phq_auth_token"
    );

    localStorage.removeItem(
      "phq_auth_user"
    );

    setToken(null);
    setUser(null);
  };

  const hasRole = (
    ...roles: UserRole[]
  ) =>
    !!user &&
    roles.includes(user.role);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      hasRole,
    }),
    [
      user,
      token,
      loading,
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

