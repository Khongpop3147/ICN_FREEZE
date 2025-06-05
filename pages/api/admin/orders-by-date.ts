// pages/api/admin/orders-by-date.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export type DailyOrdersResponse = {
  date: string;
  orderCount: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DailyOrdersResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { date } = req.query;
  if (typeof date !== "string") {
    return res.status(400).json({ error: "Missing or invalid date" });
  }

  // กำหนดช่วงเวลาตั้งแต่เที่ยงคืนถึงก่อนเที่ยงคืนของวันถัดไป
  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);

  const orderCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  res.status(200).json({ date, orderCount });
}
