"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PromoModal from "./PromoModal";
import CookieConsent from "./CookieConsent"; // import component cookie consent
import type { ReactNode } from "react";

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
  // state ควบคุมการโชว์ popup cookie consent
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // ตรวจสอบ promo modal
      const seenPromo = localStorage.getItem("promoShown");
      if (!seenPromo) {
        setShowPromo(true);
        localStorage.setItem("promoShown", "true");
      }

      // ตรวจสอบ cookie consent
      const cookieConsent = localStorage.getItem("cookieConsent"); // หรือ Cookies.get("cookieConsent") ถ้าใช้ js-cookie
      if (!cookieConsent) {
        setShowCookieConsent(true);
      }
    }
  }, []);

  // ฟังก์ชันปิด cookie consent popup และเซ็ตสถานะ
  const handleCookieConsent = (accepted: boolean) => {
    localStorage.setItem("cookieConsent", accepted ? "true" : "false");
    setShowCookieConsent(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content="ตลาดสินค้าเกษตรสดใหม่ ICN_FREEZE" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Navbar ชิดบนสุด */}
      <header>
        <Navbar />
      </header>

      {/* แสดง modal โปรโมชัน */}
      <PromoModal show={showPromo} onClose={() => setShowPromo(false)} />

      {/* แสดง popup cookie consent */}
      {showCookieConsent && (
        <CookieConsent
          onAccept={() => handleCookieConsent(true)}
          onDecline={() => handleCookieConsent(false)}
        />
      )}

      {/* เนื้อหาแต่ละหน้าหลัก ให้มี padding ด้านข้างตามดีไซน์ */}
      <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer กว้างเต็มจอ */}
      <Footer />
    </div>
  );
}
