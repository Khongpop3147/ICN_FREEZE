"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookieConsent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    Cookies.set("cookieConsent", "true", { expires: 365 });
    setShow(false);
    if (onAccept) onAccept();
  };

  const decline = () => {
    Cookies.set("cookieConsent", "false", { expires: 365 });
    setShow(false);
    if (onDecline) onDecline();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-3xl bg-white border shadow-lg rounded-lg p-4 flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6 text-center md:text-left">
      <p className="text-gray-700 flex-1 text-sm md:text-base">
        เว็บไซต์นี้ใช้คุกกี้เพื่อเพิ่มประสิทธิภาพการใช้งานและวิเคราะห์ข้อมูลการใช้งาน
        โปรดยอมรับเพื่อให้เราสามารถให้บริการที่ดีที่สุดแก่คุณ
      </p>
      <div className="flex space-x-4">
        <button
          onClick={accept}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          aria-label="Accept cookies"
        >
          ยอมรับ
        </button>
        <button
          onClick={decline}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
          aria-label="Decline cookies"
        >
          ไม่ยอมรับ
        </button>
      </div>
    </div>
  );
}
