// pages/admin/coupons.tsx
import { GetServerSideProps, NextPage } from "next";
import { useState, FormEvent } from "react";
import Layout from "@/components/AdminLayout";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";

interface Coupon {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  usageLimit: number | null;
  expiresAt: string | null;
}

interface Props {
  initial: Coupon[];
}

const AdminCouponsPage: NextPage<Props> = ({ initial }) => {
  const [coupons, setCoupons] = useState<Coupon[]>(initial);
  const [form, setForm] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    usageLimit: "",
    expiresAt: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addCoupon = async (e: FormEvent) => {
    e.preventDefault();
    const code = form.code.trim();
    const discountValue = parseFloat(form.discountValue);
    const usageLimit = form.usageLimit
      ? parseInt(form.usageLimit, 10)
      : undefined;
    const expiresAt = form.expiresAt || undefined;

    if (!code || isNaN(discountValue) || discountValue <= 0) {
      alert("กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        discountType: form.discountType,
        discountValue,
        usageLimit,
        expiresAt,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setCoupons((prev) => [
        ...prev,
        {
          id: data.id,
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          usageLimit: data.usageLimit,
          expiresAt: data.expiresAt,
        },
      ]);
      setForm({
        code: "",
        discountType: "percent",
        discountValue: "",
        usageLimit: "",
        expiresAt: "",
      });
    } else {
      alert("Error: " + (data.error || "ไม่สามารถเพิ่มคูปองได้"));
    }
  };

  return (
    <Layout title="จัดการคูปอง (Admin)">
      <h1 className="text-3xl font-bold mb-4">จัดการคูปอง</h1>
      <Link href="/" className="text-blue-600 mb-6 block">
        &larr; กลับหน้าหลัก
      </Link>

      <form onSubmit={addCoupon} className="space-y-4 mb-8 max-w-md">
        <input
          name="code"
          value={form.code}
          onChange={handleChange}
          placeholder="รหัสคูปอง"
          className="border p-2 w-full rounded"
          required
        />
        <div className="flex gap-2">
          <select
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
          >
            <option value="percent">เปอร์เซ็นต์ (%)</option>
            <option value="fixed">จำนวนเงินคงที่</option>
          </select>
          <input
            name="discountValue"
            value={form.discountValue}
            onChange={handleChange}
            placeholder="มูลค่าส่วนลด"
            type="number"
            className="border p-2 rounded flex-1"
            required
          />
        </div>
        <input
          name="usageLimit"
          value={form.usageLimit}
          onChange={handleChange}
          placeholder="จำกัดการใช้ (ไม่บังคับ)"
          type="number"
          className="border p-2 w-full rounded"
        />
        <input
          name="expiresAt"
          value={form.expiresAt}
          onChange={handleChange}
          placeholder="วันหมดอายุ (ไม่บังคับ)"
          type="date"
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "กำลังบันทึก..." : "เพิ่มคูปอง"}
        </button>
      </form>

      <div className="space-y-2">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-6 gap-2 border p-3 rounded text-sm"
          >
            <span className="col-span-1 font-medium">{c.code}</span>
            <span className="col-span-1">
              {c.discountType === "percent"
                ? `${c.discountValue}%`
                : `${c.discountValue} ฿`}
            </span>
            <span className="col-span-1">{c.usageLimit ?? "-"}</span>
            <span className="col-span-2">
              {c.expiresAt
                ? new Date(c.expiresAt)
                    // ฟอร์แมตเป็น DD/MM/YYYY ตายตัว (ไม่ขึ้นกับ locale)
                    .toLocaleDateString("en-GB")
                : "-"}
            </span>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default AdminCouponsPage;

export const getServerSideProps: GetServerSideProps = async (ctx) =>
  adminGuard(ctx, async () => {
    const raw = await prisma.coupon.findMany({
      /* ... */
    });
    const initial: Coupon[] = raw.map((c) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType as "percent" | "fixed",
      discountValue: c.discountValue,
      usageLimit: c.usageLimit,
      expiresAt: c.expiresAt?.toISOString() ?? null,
    }));
    return { props: { initial } };
  });
