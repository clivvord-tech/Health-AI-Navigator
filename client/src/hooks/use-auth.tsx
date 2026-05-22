import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

export type Plan = "free" | "basic" | "premium";

type User = {
  id: string;
  name: string;
  email: string;
  plan: Plan;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, name?: string, plan?: Plan) => void;
  logout: () => void;
  upgradePlan: (plan: Plan) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateUserId(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  return `user_${Math.abs(hash).toString(36)}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("medinav_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.id) parsed.id = generateUserId(parsed.email);
      if (!parsed.plan) parsed.plan = "free";
      setUser(parsed);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name = "User", plan: Plan = "free") => {
    const newUser: User = { id: generateUserId(email), email, name, plan };
    setUser(newUser);
    localStorage.setItem("medinav_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("medinav_user");
    setLocation("/");
  };

  const upgradePlan = (plan: Plan) => {
    if (!user) return;
    const updated = { ...user, plan };
    setUser(updated);
    localStorage.setItem("medinav_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, upgradePlan, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
