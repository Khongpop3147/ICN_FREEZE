// pages/api/coupons/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET /api/coupons → ส่ง list ทั้งหมด (ถ้าอยากมี)
  if (req.method === "GET") {
    const coupons = await prisma.coupon.findMany();
    return res.status(200).json({ items: coupons });
  }

  // POST /api/coupons → ใช้เป็น apply
  if (req.method === "POST") {
    const { code } = req.body as { code?: string };
    if (!code) {
      return res.status(400).json({ error: "Coupon code is required" });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return res.status(400).json({ error: "Invalid coupon code" });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ error: "Coupon has expired" });
    }
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }

    // เพิ่ม counter
    await prisma.coupon.update({
      where: { code },
      data: { usedCount: coupon.usedCount + 1 },
    });

    return res.status(200).json({ discountValue: coupon.discountValue });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
