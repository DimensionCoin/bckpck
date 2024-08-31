"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string; 
}

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = ["/signin", "/signup"].includes(pathname);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/check-auth", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user === null && !isAuthPage) {
        router.push("/");
      } else if (user !== null && isAuthPage) {
        router.push("/dashboard");
      }
    }
  }, [user, isAuthPage, loading, router]);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
