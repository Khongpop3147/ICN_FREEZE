// pages/checkout.tsx
"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProvinceSelect from "@/components/ProvinceSelect";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Types
interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    imageUrl?: string | null;
    stock: number;
  };
}

type OrderItemPayload = {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
};

type AddressPayload = {
  recipient: string;
  line1: string;
  line2: string;
  line3: string; // เพิ่ม field line3
  city: string;
  postalCode: string;
  country: string;
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState<AddressPayload>({
    recipient: "",
    line1: "",
    line2: "",
    line3: "", // กำหนดค่าเริ่มต้น
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

  // ฟังก์ชันอัพเดตจำนวนสินค้าในตะกร้า
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (newQuantity < 1) {
      alert("จำนวนต้องไม่น้อยกว่า 1");
      return;
    }
    if (newQuantity > item.product.stock) {
      alert(`จำนวนเกิน stock ที่มี (สูงสุด ${item.product.stock})`);
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
    );

    await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: newQuantity }),
    });
  };

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
    } catch {
      setCouponError("เกิดข้อผิดพลาดในการตรวจสอบคูปอง");
    }
  };

  const createBankTransferOrder = async (): Promise<Response> => {
    const orderItems: OrderItemPayload[] = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      priceAtPurchase: item.product.salePrice ?? item.product.price,
    }));
    const formData = new FormData();
    formData.append("items", JSON.stringify(orderItems));
    Object.entries(address).forEach(([key, val]) => {
      formData.append(key, val);
    });
    formData.append("paymentMethod", paymentMethod);
    if (couponCode.trim()) formData.append("couponCode", couponCode.trim());
    if (slipFile) formData.append("slipFile", slipFile, slipFile.name);

    return await fetch("/api/admin/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  };

  type PaymentFormProps = {
    orderItems: OrderItemPayload[];
    address: AddressPayload;
    total: number;
  };

  const PaymentForm: React.FC<PaymentFormProps> = ({
    orderItems,
    address,
    total,
  }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;
      setProcessing(true);
      const { clientSecret, error: intentError } = await fetch(
        "/api/payments/create-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: total * 100 }),
        }
      ).then((r) => r.json());
      if (intentError) {
        alert(intentError);
        setProcessing(false);
        return;
      }
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );
      if (error) {
        alert(error.message);
        setProcessing(false);
        return;
      }
      if (paymentIntent?.status === "succeeded") {
        const res = await fetch("/api/admin/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: orderItems,
            ...address,
            paymentMethod: "credit_card",
            couponCode: couponCode.trim() || null,
            slipUrl: null,
          }),
        });
        if (res.ok) {
          router.push("/success");
        } else {
          const err = await res.json();
          alert("Order error: " + err.error);
        }
      }
      setProcessing(false);
    };

    return (
      <form onSubmit={onSubmit} className="space-y-6">
        <CardElement className="border p-2 rounded" />
        <button
          type="submit"
          disabled={!stripe || processing}
          className="px-6 py-3 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {processing ? "Processing..." : `Pay ${total} ฿`}
        </button>
      </form>
    );
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Layout title="Checkout">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 border rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 border rounded"
                    >
                      +
                    </button>
                  </div>
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
            <div className="mt-1">
              <span className="line-through text-gray-500 mr-2">
                {subtotal} ฿
              </span>
              <span className="text-green-700 font-bold">{total} ฿</span>
            </div>
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
          <input
            type="text"
            placeholder="แขวง / เขต หรือ บรรทัดที่ 3"
            value={address.line3}
            onChange={(e) => setAddress({ ...address, line3: e.target.value })}
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

        {/* วิธีการชำระเงิน */}
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
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  const res = await createBankTransferOrder();
                  setLoading(false);
                  if (res.ok) {
                    router.push("/success");
                  } else {
                    const err = await res.json();
                    alert("Error: " + err.error);
                  }
                }}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded disabled:opacity-50 mt-4"
              >
                {loading ? "Processing..." : "ยืนยันโอนผ่านธนาคาร"}
              </button>
            </div>
          )}

          {paymentMethod === "credit_card" && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                orderItems={items.map((item) => ({
                  productId: item.product.id,
                  quantity: item.quantity,
                  priceAtPurchase: item.product.salePrice ?? item.product.price,
                }))}
                address={address}
                total={total}
              />
            </Elements>
          )}

          {paymentMethod === "cod" && (
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                const res = await (async () => {
                  const orderItems = items.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    priceAtPurchase:
                      item.product.salePrice ?? item.product.price,
                  }));
                  const formData = new FormData();
                  formData.append("items", JSON.stringify(orderItems));
                  Object.entries(address).forEach(([k, v]) =>
                    formData.append(k, v)
                  );
                  formData.append("paymentMethod", "cod");
                  if (couponCode.trim())
                    formData.append("couponCode", couponCode.trim());
                  return fetch("/api/admin/orders", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                  });
                })();
                setLoading(false);
                if (res.ok) {
                  router.push("/success");
                } else {
                  const err = await res.json();
                  alert("Error: " + err.error);
                }
              }}
              disabled={loading}
              className="px-6 py-3 bg-yellow-500 text-white rounded disabled:opacity-50"
            >
              {loading ? "Processing..." : "ยืนยันเก็บเงินปลายทาง"}
            </button>
          )}
        </div>
      </form>
    </Layout>
  );
}
