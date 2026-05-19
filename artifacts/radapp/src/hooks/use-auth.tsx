import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateUserId(email: string): string {
  // Stable deterministic ID from email
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
    const storedUser = localStorage.getItem("radapp_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      // Migrate old users without id
      if (!parsed.id) {
        parsed.id = generateUserId(parsed.email);
        localStorage.setItem("radapp_user", JSON.stringify(parsed));
      }
      setUser(parsed);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name = "User") => {
    const newUser = { id: generateUserId(email), email, name };
    setUser(newUser);
    localStorage.setItem("radapp_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("radapp_user");
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
