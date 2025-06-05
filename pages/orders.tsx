// pages/orders.tsx
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

// Types
interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  product: { name: string; imageUrl?: string | null };
}

type OrderSummary = {
  id: string;
  totalAmount: number;
  status: string;      // PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED
  createdAt: string;
  items: OrderItem[];
};

// แปลงสถานะเป็นภาษาไทย
const T: Record<string,string> = {
  pending:    "รอดำเนินการ",
  processing: "กำลังดำเนินการ",
  shipped:    "จัดส่งแล้ว",
  completed:  "สำเร็จ",
  cancelled:  "ยกเลิกแล้ว",
};

export default function OrdersPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // fetcher สำหรับ SWR
  const fetcher = (url: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) throw new Error("โหลดคำสั่งซื้อไม่สำเร็จ");
        return r.json();
      })
      .then(data => data.orders as OrderSummary[]);

  // SWR: revalidateOnFocus = false ลดการยิง request ตอน focus window
  const { data: orders, error, mutate } = useSWR(
    token ? "/api/orders" : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // ตรวจสอบ token และ redirect ถ้าไม่มี
  useEffect(() => {
    if (token === null) {
      router.replace("/login");
    }
  }, [token, router]);

  if (token === null) return null;

  if (error) {
    return (
      <Layout title="คำสั่งซื้อของฉัน">
        <div className="p-8 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดคำสั่งซื้อ</div>
      </Layout>
    );
  }

  if (!orders) {
    return (
      <Layout title="คำสั่งซื้อของฉัน">
        <div className="p-8 text-center text-gray-500">กำลังโหลดคำสั่งซื้อ…</div>
      </Layout>
    );
  }

  // ฟังก์ชันยืนยันรับสินค้า
  const confirmReceived = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "completed" }),
      });
      if (!res.ok) throw new Error();
      // อัปเดตใน cache ของ SWR ทันทีโดยไม่ revalidate ทั้งหมด
      mutate(
        orders.map(o =>
          o.id === orderId ? { ...o, status: "COMPLETED" } : o
        ),
        false
      );
    } catch {
      alert("ยืนยันรับสินค้าไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Layout title="คำสั่งซื้อของฉัน">
      <div className="px-4 sm:px-6 md:px-8">
        <h1 className="text-4xl font-bold mb-6">คำสั่งซื้อของฉัน</h1>

        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-600 text-lg">ยังไม่มีคำสั่งซื้อ</div>
        ) : (
          <ul className="space-y-6">
            {orders.map(o => (
              <li
                key={o.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow hover:shadow-lg transition"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div>
                    <p className="text-2xl font-semibold">ออร์เดอร์ #{o.id.slice(-6)}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(o.createdAt).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0 text-right">
                    <p className="text-xl font-semibold">{o.totalAmount} ฿</p>
                    <p className="text-md text-gray-500">{T[o.status.toLowerCase()]}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {o.items.map(it => (
                    <div key={it.id} className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {it.product.imageUrl ? (
                          <img
                            src={it.product.imageUrl}
                            alt={it.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">ไม่มีรูป</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-medium truncate">{it.product.name}</p>
                        <p className="text-sm text-gray-500">{it.quantity} × {it.priceAtPurchase} ฿</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ปุ่มยืนยันรับสินค้า */}
                {o.status.toLowerCase() !== "completed" && (
                  <div className="text-right">
                    <button
                      onClick={() => confirmReceived(o.id)}
                      disabled={updatingId === o.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updatingId === o.id ? "กำลังยืนยัน..." : "ยืนยันฉันได้รับสินค้าแล้ว"}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
