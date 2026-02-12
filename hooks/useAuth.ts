"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data);

      } catch (error: any) {
        setUser(null);

      } finally {
        setLoading(false);

      }

    };

    fetchUser();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
