"use client";

import { logoutUser } from "@/action/auth";
import { fetcher } from "@/utils/fetcher";
import { User } from "@prisma/client";
import { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setLoading(true)
    fetcher("/api/auth/logout",{
      method : "POST",
      headers : {
        "Content-Type" : "application/json"
      }
    })
      .then((res) => {
        setUser(null);
      })
      .catch((err) => {
        console.log(err);
      }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetcher("/api/auth/authenticate")
      .then((data) => {
        const { user } = data as { messsage: string; user?: User | null };
        setUser(user || null);
      })
      .catch((error) => {
        setUser(null);
        console.log("Error authenticating user - ", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
