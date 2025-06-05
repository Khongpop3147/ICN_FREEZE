"use client";

import { useState, useEffect, ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({
  children,
  title = "ICN_FREEZE",
}: LayoutProps) {
  // state ควบคุมการโชว์โปรโมชัน
  const [showPromo, setShowPromo] = useState(false);

  // เช็ก localStorage ครั้งแรก ถ้ายังไม่เคยโชว์ ให้แสดง modal แล้วเซ็ต flag
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("promoShown");
      if (!seen) {
        setShowPromo(true);
        localStorage.setItem("promoShown", "true");
      }
    }
  }, []);

  return (
    <>
      <div className="flex h-screen bg-[#dbe8d8]">
        {/* Sidebar ทางซ้าย ให้อยู่เต็มความสูง ไม่เลื่อน */}
        <AdminSidebar />

        {/* Main content */}
        <main className="flex-1 p-6 bg-white overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}
