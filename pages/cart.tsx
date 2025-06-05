// pages/cart.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    imageUrl?: string | null;
    stock: number; // เพิ่ม stock เข้ามาใน type
  };
}

export default function CartPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // อัพเดตจำนวนสินค้าในตะกร้า พร้อมตรวจสอบ stock ไม่ให้เกิน
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!token) return;
    if (quantity < 1) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (quantity > item.product.stock) {
      alert(`จำนวนเกิน stock ที่มี (สูงสุด ${item.product.stock})`);
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, quantity }),
      });
      if (res.ok) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!token) return;
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
      });
      loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCart();
  }, [token]);

  const total = items.reduce((sum, item) => {
    const unit = item.product.salePrice ?? item.product.price;
    return sum + unit * item.quantity;
  }, 0);

  if (!token) {
    return (
      <Layout title="ตะกร้าสินค้า">
        <div className="py-20 text-center">
          <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="mb-4">
            กรุณา&nbsp;
            <Link href="/login" className="text-green-600 hover:underline">
              Login
            </Link>
            &nbsp;ก่อนดูตะกร้า
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="ตะกร้าสินค้า">
      <h1 className="text-3xl font-bold mb-6">ตะกร้าสินค้า</h1>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="mb-4">ตะกร้าว่างเปล่า</p>
          <Link
            href="/all-products"
            className="inline-block btn bg-green-600 hover:bg-green-700 text-white"
          >
            ดูสินค้าเพิ่มเติม
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-6 mb-8">
            {items.map((item) => {
              const unit = item.product.salePrice ?? item.product.price;
              return (
                <div
                  key={item.id}
                  className="card flex items-center p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                    <Image
                      src={item.product.imageUrl ?? "/images/placeholder.png"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 px-4">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-medium text-lg hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-gray-500 text-sm mt-1">
                      ราคาต่อหน่วย: ฿{unit}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                      >
                        –
                      </button>
                      <input
                        type="number"
                        className="w-12 border text-center rounded"
                        value={item.quantity}
                        min={1}
                        max={item.product.stock} // กำหนด max จาก stock
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 1 && val <= item.product.stock)
                            updateQuantity(item.id, val);
                          else if (val > item.product.stock)
                            alert(
                              `จำนวนเกิน stock ที่มี (สูงสุด ${item.product.stock})`
                            );
                        }}
                      />
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      รวม: ฿{unit * item.quantity}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-2 text-red-600 hover:underline"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-xl font-bold">ยอดรวมทั้งหมด:</span>
            <span className="text-2xl font-bold text-green-700">{total} ฿</span>
          </div>

          <div className="text-right mt-6">
            <button
              onClick={() => router.push("/checkout")}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ดำเนินการชำระเงิน
            </button>
          </div>
        </>
      )}
    </Layout>
  );
}
