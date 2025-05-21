"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProvinceSelect from "@/components/ProvinceSelect";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    imageUrl?: string | null;
  };
}

export default function CheckoutPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    recipient: "",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [slipFile, setSlipFile] = useState<File | null>(null);

  // coupon state
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    fetch("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, router]);

  const subtotal = items.reduce((sum, item) => {
    const unit = item.product.salePrice ?? item.product.price;
    return sum + unit * item.quantity;
  }, 0);
  const total = Math.max(subtotal - discountAmount, 0);

  const applyCoupon = async () => {
    setCouponError(null);
    if (!couponCode.trim()) {
      setCouponError("กรุณากรอกรหัสคูปอง");
      return;
    }
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setDiscountAmount(0);
        setCouponError(error);
      } else {
        const { discountValue } = await res.json();
        setDiscountAmount(discountValue);
      }
    } catch (err) {
      console.error(err);
      setCouponError("เกิดข้อผิดพลาดในการตรวจสอบคูปอง");
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.recipient || !address.line1 || !address.city) {
      alert("กรุณากรอกที่อยู่จัดส่งให้ครบถ้วน");
      return;
    }

    setLoading(true);
    const orderItems = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      priceAtPurchase: item.product.salePrice ?? item.product.price,
    }));

    try {
      let res: Response;
      if (paymentMethod === "bank_transfer" && slipFile) {
        const formData = new FormData();
        formData.append("items", JSON.stringify(orderItems));
        Object.entries(address).forEach(([key, val]) => {
          formData.append(key, val);
        });
        formData.append("paymentMethod", paymentMethod);
        if (couponCode.trim()) formData.append("couponCode", couponCode.trim());
        formData.append("slipFile", slipFile, slipFile.name);

        res = await fetch("/api/orders", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        // ส่ง JSON ปกติ
        const body = {
          items: orderItems,
          ...address,
          paymentMethod,
          couponCode: couponCode.trim() || null,
        };
        res = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Create order failed");
      }
      router.push("/success");
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการสั่งซื้อ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Checkout">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <form onSubmit={placeOrder} className="space-y-6">
        {/* รายการสินค้า */}
        <div className="space-y-4">
          {items.map((item) => {
            const unit = item.product.salePrice ?? item.product.price;
            return (
              <div
                key={item.id}
                className="flex items-center border p-4 rounded"
              >
                <img
                  src={item.product.imageUrl || "/images/placeholder.png"}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-gray-600">
                    {unit} ฿ × {item.quantity}
                  </p>
                </div>
                <div className="font-semibold">{unit * item.quantity} ฿</div>
              </div>
            );
          })}
          <div className="text-right text-xl font-bold">
            ยอดรวมย่อย: {subtotal} ฿
          </div>
        </div>

        {/* คูปองส่วนลด */}
        <div>
          <h2 className="text-xl font-semibold mb-2">คูปองส่วนลด</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="กรอกรหัสคูปอง"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 border p-2 rounded"
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              ใช้โค้ด
            </button>
          </div>
          {couponError && <p className="mt-1 text-red-600">{couponError}</p>}
          {discountAmount > 0 && (
            <p className="mt-1 text-green-700">รับส่วนลด {discountAmount} ฿</p>
          )}
        </div>

        {/* ฟอร์มที่อยู่จัดส่ง */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">ที่อยู่จัดส่ง</h2>
          <input
            type="text"
            placeholder="ชื่อผู้รับ"
            value={address.recipient}
            onChange={(e) =>
              setAddress({ ...address, recipient: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="บ้านเลขที่ / ถนน"
            value={address.line1}
            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="ตำบล / อำเภอ"
            value={address.line2}
            onChange={(e) => setAddress({ ...address, line2: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <div className="flex gap-2">
            <ProvinceSelect
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
            <input
              type="text"
              placeholder="รหัสไปรษณีย์"
              value={address.postalCode}
              onChange={(e) =>
                setAddress({ ...address, postalCode: e.target.value })
              }
              className="w-32 border p-2 rounded"
            />
          </div>
          <input
            type="text"
            placeholder="ประเทศ"
            value={address.country}
            onChange={(e) =>
              setAddress({ ...address, country: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* วิธีชำระเงิน และสลิป */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-2">วิธีการชำระเงิน</h2>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="bank_transfer">โอนผ่านธนาคาร</option>
            <option value="credit_card">บัตรเครดิต</option>
            <option value="cod">เก็บเงินปลายทาง</option>
          </select>

          {paymentMethod === "bank_transfer" && (
            <div>
              <h3 className="text-lg font-semibold mb-2">อัปโหลดสลิปการโอน</h3>
              <input
                type="file"
                name="slipFile"
                accept="image/*"
                onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                className="border p-2 rounded w-full"
              />
              <div className="flex justify-center mt-4">
                <img
                  src="/images/1.png"
                  alt="QR Code ธนาคาร"
                  className="w-56 h-56 object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* ยอดรวมและปุ่มยืนยัน */}
        <div className="flex justify-between items-center border-t pt-4">
          <span className="text-xl font-bold">ยอดรวมทั้งสิ้น:</span>
          <span className="text-2xl font-bold text-green-700">{total} ฿</span>
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "กำลังดำเนินการ..." : "ยืนยันคำสั่งซื้อ"}
          </button>
        </div>
      </form>
    </Layout>
  );
}
