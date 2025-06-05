"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface BannerSlide {
  title: string;
  sub: string;
  img: string;
}

interface BannerProps {
  slides: BannerSlide[];
  /** ถ้าเป็นแบนเนอร์ Promotion ให้เปลี่ยนสไตล์หัวเรื่อง */
  isPromotion?: boolean;
}

export default function Banner({ slides, isPromotion = false }: BannerProps) {
  // ถ้าไม่มี slides หรือ array ว่าง ไม่ต้องเรนเดอร์อะไร
  if (!slides || slides.length === 0) return null;

  const [idx, setIdx] = useState(0);
  const total = slides.length;

  // auto-slide ทุก 5 วิ
  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  return (
    <div className="relative w-full h-40 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-3xl mb-6">
      {/* รูปพื้นหลัง */}
      <Image
        src={slides[idx].img}
        alt={slides[idx].title}
        fill
        className="object-cover"
      />

      {/* Overlay กราดิเอนต์ + ข้อความ */}
      <div>
        <div className="text-white max-w-lg">
          <p className="uppercase text-xs sm:text-sm mb-2">{slides[idx].sub}</p>
          <h2
            className={`font-bold ${
              isPromotion ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {slides[idx].title}
          </h2>
        </div>
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={prev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white border-2 border-green-200 p-2 sm:p-3 rounded-full shadow-lg z-10"
      >
        <ChevronLeft size={20} className="text-green-600" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white border-2 border-green-200 p-2 sm:p-3 rounded-full shadow-lg z-10"
      >
        <ChevronRight size={20} className="text-green-600" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === idx ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
