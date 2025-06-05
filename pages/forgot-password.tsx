"use client";
import { useState } from "react";
import Layout from "@/components/Layout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลเรียบร้อยแล้ว");
      } else {
        setError(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">ลืมรหัสผ่าน</h1>
        {message && <p className="text-green-600 mb-2">{message}</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="กรอกอีเมลของคุณ"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            ส่งลิงก์รีเซ็ตรหัสผ่าน
          </button>
        </form>
      </div>
    </Layout>
  );
}
