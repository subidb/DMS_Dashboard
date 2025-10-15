"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

type Role = "finance" | "marketing" | "admin";

interface User {
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: User;
  setRole: (role: Role) => void;
}

const defaultUser: User = {
  name: "Isha Pathak",
  email: "ops@embglobal.com",
  role: "finance"
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);

  const setRole = useCallback((role: Role) => {
    setUser((current) => ({ ...current, role }));
  }, []);

  const value = useMemo(() => ({ user, setRole }), [user, setRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
