// components/Footer.tsx
"use client";

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white">
      <div className="container py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 text-center">
          <a href="/qa" className="hover:underline">
            คำถามที่พบบ่อย
          </a>
          <a href="/contact" className="hover:underline">
            ติดต่อเรา
          </a>
          <a href="/privacy-policy" className="hover:underline">
            ประกาศความเป็นส่วนตัวของลูกค้า
          </a>
          <a href="/cookie-policy" className="hover:underline">
            นโยบายการใช้งานคุกกี้
          </a>
          <a href="/terms" className="hover:underline">
            ข้อกำหนดและเงื่อนไข
          </a>
        </div>
        <p className="text-center text-xs sm:text-sm mt-6">
          Copyright © {new Date().getFullYear()} Iconnex Thailand Developer. All
          Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
