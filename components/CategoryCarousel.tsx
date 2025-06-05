"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@/types/product";

interface CategoryCarouselProps {
  /** หมวดหมู่ อาจมา undefined ได้ ให้ default เป็น [] */
  categories?: Category[];
}

export default function CategoryCarousel({
  categories = [], // ใส่ default ให้ไม่พัง
}: CategoryCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (delta: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="relative py-3 bg-green-50">
      {/* ปุ่มเลื่อนซ้าย */}
      <button
        onClick={() => scroll(-200)}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white p-3 sm:p-2 rounded-full shadow-md hover:shadow-lg transition-shadow z-10"
        aria-label="Scroll categories left"
      >
        <ChevronLeft size={20} className="text-gray-700" />
      </button>

      {/* แถบเลื่อนหมวดหมู่ */}
      <div
        ref={containerRef}
        className="flex space-x-3 overflow-x-auto px-4 sm:px-8 scrollbar-hide"
        style={{ paddingBottom: 8 }} // กันไม่ให้ตกขอบล่าง
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/all-products?category=${cat.id}`}
            className="flex-shrink-0 bg-white rounded-lg shadow-sm px-4 sm:px-5 py-2 sm:py-3 hover:bg-green-100 transition-colors select-none cursor-pointer"
          >
            <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      {/* ปุ่มเลื่อนขวา */}
      <button
        onClick={() => scroll(200)}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white p-3 sm:p-2 rounded-full shadow-md hover:shadow-lg transition-shadow z-10"
        aria-label="Scroll categories right"
      >
        <ChevronRight size={20} className="text-gray-700" />
      </button>
    </div>
  );
}
