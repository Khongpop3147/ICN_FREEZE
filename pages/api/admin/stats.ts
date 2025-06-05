// pages/api/admin/stats.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export type StatsResponse = {
  totalSales: number;
  totalOrders: number;
  newCustomers: number;
  topProducts: Array<{ name: string; sold: number }>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  // 1. ยอดขายทั้งหมด (sum ของ totalAmount ทุกออร์เดอร์)
  const salesAgg = await prisma.order.aggregate({
    _sum: { totalAmount: true },
  });
  const totalSales = salesAgg._sum.totalAmount ?? 0;

  // 2. จำนวนออร์เดอร์ทั้งหมด
  const totalOrders = await prisma.order.count();

  // 3. ลูกค้าใหม่ (นับผู้ใช้ที่สมัครภายใน 30 วันที่ผ่านมา)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newCustomers = await prisma.user.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });

  // 4. สินค้าขายดี (top 5 ตามจำนวนที่ขายได้)
  const top = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  // ดึงชื่อสินค้า
  const topProducts = await Promise.all(
    top.map(async (t) => {
      const prod = await prisma.product.findUnique({
        where: { id: t.productId },
        select: { name: true },
      });
      return {
        name: prod?.name ?? "Unknown",
        sold: t._sum.quantity ?? 0,
      };
    })
  );

  res.status(200).json({
    totalSales,
    totalOrders,
    newCustomers,
    topProducts,
  });
}
