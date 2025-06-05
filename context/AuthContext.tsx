"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  /**
   * @param remember ถ้า true → คุกกี้อยู่ได้นาน 7 วัน
   *                 ถ้า false → คุกกี้เป็น session cookie (หายเมื่อปิดเบราว์เซอร์)
   */
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  adminLogout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // โหลด token จากคุกกี้ตอน mount
  useEffect(() => {
    const t = Cookies.get("token");
    if (t) {
      setToken(t);
      // ดึงข้อมูลโปรไฟล์ (ถ้ามี API)
      fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data.user))
        .catch(() => logout());
    }
  }, []);

  const login = async (email: string, password: string, remember: boolean) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "Invalid credentials");
    }
    const { user: u, token: tkn } = await res.json();

    // เซ็ตคุกกี้
    if (remember) {
      Cookies.set("token", tkn, { expires: 7 });
    } else {
      Cookies.set("token", tkn);
    }

    setUser(u);
    setToken(tkn);
    router.push("/");
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  const adminLogout = async () => {
    // 1. ล้าง HTTP-only cookie บนเซิร์ฟเวอร์
    await fetch("/api/auth/logout", { method: "POST" });

    // 2. ถ้าคุณเคยเซ็ต cookie ด้วย js-cookie ด้วยชื่อเดียวกัน
    Cookies.remove("token");

    // 3. เคลียร์ state และ redirect
    setUser(null);
    setToken(null);
    router.push("/admin/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
