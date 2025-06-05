// pages/orders/success.tsx
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="max-w-xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-6 text-green-700">ชำระเงินสำเร็จ</h1>
      <p className="text-lg mb-8">
        ขอบคุณสำหรับคำสั่งซื้อของคุณ! เราจะดำเนินการจัดส่งให้เร็วที่สุด
      </p>
      <Link
        href="/"
        className="inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
      >
        กลับหน้าหลัก
      </Link>
    </div>
  );
}
