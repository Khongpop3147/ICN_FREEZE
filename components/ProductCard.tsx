// components/ProductCard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product & { stock: number };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { token } = useAuth();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setAdding(true);
    try {
      const cartRes = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!cartRes.ok) throw new Error("Cannot fetch cart");
      const { items: cartItems } = await cartRes.json();
      const currentQuantity =
        (cartItems as { productId: string; quantity: number }[]).find(
          (item) => item.productId === product.id
        )?.quantity ?? 0;
      if (currentQuantity + 1 > product.stock) {
        alert("จำนวนสินค้าเกินสต็อกที่มี");
        setAdding(false);
        return;
      }
      const addRes = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!addRes.ok) throw new Error("Failed to add to cart");
      router.push("/cart");
    } catch {
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="w-full max-w-[200px] bg-white border rounded-2xl p-4 flex flex-col space-y-4 text-center shadow-sm hover:shadow-lg transition relative">
      {product.stock > 0 ? (
        <Link
          href={`/products/${product.id}`}
          className="group flex flex-col space-y-2 relative z-10"
        >
          {/* รูป */}
          <div className="relative w-full pt-[100%] rounded-lg overflow-hidden">
            <Image
              src={product.imageUrl ?? "/images/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* ชื่อสินค้า (16px, ปกติ) */}
          <h3 className="text-base font-normal text-black group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>

          {/* รายละเอียด (14px) */}
          {product.description && (
            <p className="text-gray-500 text-sm line-clamp-2">
              {product.description}
            </p>
          )}

          {/* ราคาสินค้า */}
          <div className="flex items-center justify-center space-x-2">
            {product.salePrice != null ? (
              <>
                {/* ราคาตัวเก่า: 14px, สีเทา, ไม่หนา */}
                <span className="text-gray-400 line-through text-sm font-normal">
                  ฿{product.price}
                </span>
                {/* ราคาหลังลด: 18px, ไม่หนา */}
                <span className="text-red-600 text-lg font-bold">
                  ฿{product.salePrice}
                </span>
              </>
            ) : (
              /* ราคาปกติ: 18px, ไม่หนา */
              <span className="text-green-600 text-lg font-bold">
                ฿{product.price}
              </span>
            )}
          </div>
        </Link>
      ) : (
        <div className="flex flex-col space-y-2 cursor-default relative z-10">
          {/* รูป + overlay */}
          <div className="relative w-full pt-[100%] rounded-lg overflow-hidden">
            <Image
              src={product.imageUrl ?? "/images/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg text-red-600 font-bold">
              สินค้าหมด
            </div>
          </div>

          {/* ชื่อสินค้า (16px, ปกติ) */}
          <h3 className="text-base font-normal text-black">
            {product.name}
          </h3>

          {/* รายละเอียด (14px) */}
          {product.description && (
            <p className="text-gray-500 text-sm line-clamp-2">
              {product.description}
            </p>
          )}

          {/* ราคาสินค้า */}
          <div className="flex items-center justify-center space-x-2">
            {product.salePrice != null ? (
              <>
                <span className="text-gray-400 line-through text-sm font-normal">
                  ฿{product.price}
                </span>
                <span className="text-red-600 text-lg font-bold">
                  ฿{product.salePrice}
                </span>
              </>
            ) : (
              <span className="text-green-600 text-lg font-bold">
                ฿{product.price}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ปุ่ม */}
      {product.stock === 0 ? (
        <button
          disabled
          className="mt-auto w-full py-2 sm:py-3 rounded-full bg-gray-300 text-gray-700 cursor-not-allowed"
        >
          สินค้าหมด
        </button>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`
            mt-auto
            w-full
            flex items-center justify-center space-x-2
            bg-green-600 text-white
            py-2 sm:py-3
            text-sm sm:text-base
            rounded-full hover:bg-green-700 transition
            ${adding ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <Plus size={16} />
          <span>{adding ? "กำลังเพิ่ม..." : "หยิบใส่รถเข็น"}</span>
        </button>
      )}
    </div>
  );
}
