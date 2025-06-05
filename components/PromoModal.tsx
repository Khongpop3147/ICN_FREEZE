// components/PromoModal.tsx
"use client";

import { FC } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface PromoModalProps {
  show: boolean;
  onClose: () => void;
}

const PromoModal: FC<PromoModalProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ปุ่มปิดมุมบนขวา */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        {/* รูปและ content */}
        <div className="w-full h-80 md:h-96 relative">
          <Image
            src="/images/header test1.png" // ปรับเป็น path รูปที่คุณต้องการ
            alt="โปรโมชั่นสำหรับสมาชิกใหม่"
            fill
            className="object-cover"
          />
        </div>

        {/* ปุ่มสมัคร */}
        <div className="p-6 text-center">
          <button
            onClick={onClose}
            className="btn bg-green-600 hover:bg-green-700 text-white"
          >
            สมัครเลย
          </button>
          <p className="text-xs text-gray-400 mt-2">
            *เงื่อนไขเป็นไปตามที่บริษัทฯ กำหนด
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromoModal;
