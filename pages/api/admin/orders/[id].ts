import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  // อัปเดตสถานะคำสั่งซื้อ
  if (req.method === "PATCH") {
    const { status } = req.body;
    const allowed = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    try {
      const updated = await prisma.order.update({
        where: { id: id as string },
        data: { status },
      });
      return res.status(200).json(updated);
    } catch (err) {
      console.error("Update order status error:", err);
      return res.status(500).json({ error: "Cannot update order status" });
    }
  }

  // ลบคำสั่งซื้อพร้อม OrderItems
  if (req.method === "DELETE") {
    try {
      await prisma.$transaction([
        prisma.orderItem.deleteMany({ where: { orderId: id as string } }),
        prisma.order.delete({ where: { id: id as string } }),
      ]);
      return res.status(204).end();
    } catch (err) {
      console.error("Delete order error:", err);
      return res.status(500).json({ error: "Cannot delete order" });
    }
  }

  res.setHeader("Allow", ["PATCH", "DELETE"]);
  return res.status(405).end();
}
