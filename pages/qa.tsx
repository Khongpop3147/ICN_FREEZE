// pages/qa.tsx
"use client";

import { useState, FormEvent } from "react";
import Layout from "@/components/Layout";

interface Faq {
  id: string;
  question: string;
  answer?: string | null;
}

export default function QaPage() {
  // คงไว้แค่ state ของคำถามใหม่
  const [newQ, setNewQ] = useState("");
  const [loading, setLoading] = useState(false);

  // คำถามที่พบบ่อย แบบคงที่
  const staticFaqs: Faq[] = [
    {
      id: "1",
      question: "วิธีสั่งซื้อสินค้าทำอย่างไร?",
      answer:
        "คุณสามารถเลือกสินค้าแล้วกดปุ่ม 'เพิ่มลงในตะกร้า' จากนั้นไปที่ตะกร้าและกด 'ดำเนินการชำระเงิน' ได้เลยครับ",
    },
    {
      id: "2",
      question: "รองรับการชำระเงินช่องทางใดบ้าง?",
      answer: "เรารองรับโอนผ่านธนาคาร, บัตรเครดิต และเก็บเงินปลายทาง",
    },
    {
      id: "3",
      question: "จัดส่งกี่วันถึงบ้าน?",
      answer: "ปกติภายใน 3–5 วันทำการ หลังจากยืนยันโอนเงินครับ",
    },

    {
      id: "4",
      question: "วัตถุดิบของเฟรชเก็ตต่างจากที่อื่นอย่างไร?",
      answer:
        "เรามีทีมตรวจสอบคุณภาพสินค้าและคัดเลือกจากแหล่งผลิตที่น่าเชื่อถือ โดยโรงคัดตัดแต่งของเฟรชเก็ตจะช่วยให้คุณสามารถใช้วัตถุดิบได้เต็มคุณภาพถึง 95% เมื่อเทียบกับวัตถุดิบชนิดเดียวกันจากตลาดสดทั่วไปและมีประเภทสินค้าให้เลือกใช้หลายหลายตามความต้องการ เช่น ขนาดแพ็คและสเปกของสินค้า",
    },
    // เพิ่มได้ตามต้องการ
  ];

  // ส่งคำถามใหม่เข้า API เดิม (ยังเก็บใน DB)
  const submitQuestion = async (e: FormEvent) => {
    e.preventDefault();
    if (!newQ.trim()) return;
    setLoading(true);
    const res = await fetch("/api/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQ }),
    });
    if (!res.ok) {
      alert("เกิดข้อผิดพลาด โปรดลองใหม่");
    } else {
      setNewQ("");
      alert("ส่งคำถามเรียบร้อย! ทีมงานจะตอบกลับเร็วๆ นี้");
    }
    setLoading(false);
  };

  return (
    <Layout title="ถาม-ตอบ (Q/A)">
      <h1 className="text-3xl font-bold mb-4">ถาม-ตอบ (Q/A)</h1>

      {/* ฟอร์มส่งคำถามใหม่ */}
      <form onSubmit={submitQuestion} className="mb-8">
        <textarea
          value={newQ}
          onChange={(e) => setNewQ(e.target.value)}
          placeholder="พิมพ์คำถามของคุณที่นี่..."
          className="w-full border p-2 rounded mb-2"
          rows={4}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "กำลังส่ง..." : "ส่งคำถาม"}
        </button>
      </form>

      {/* แสดงคำถามที่พบบ่อย จาก static array */}
      <h2 className="text-2xl font-semibold mb-4">คำถามที่พบบ่อย</h2>
      <div className="space-y-4">
        {staticFaqs.map((f) => (
          <div key={f.id} className="border p-4 rounded">
            <p className="font-medium">Q: {f.question}</p>
            <p className="mt-2">A: {f.answer}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
