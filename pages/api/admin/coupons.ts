// pages/api/admin/coupons.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { code, discountType, discountValue, usageLimit, expiresAt } =
      req.body as {
        code: string;
        discountType: string;
        discountValue: number;
        usageLimit?: number;
        expiresAt?: string;
      };

    if (!code || !discountType || isNaN(discountValue)) {
      return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน" });
    }

    try {
      const coupon = await prisma.coupon.create({
        data: {
          code,
          discountType,
          discountValue,
          usageLimit: usageLimit ?? null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      });
      return res.status(201).json(coupon);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ถ้าไม่ใช่ POST
  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
