import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  //   // ตรวจสอบสิทธิ์แอดมิน
  //   const authHeader = req.headers.authorization;
  //   const user = await getUserFromToken(authHeader);
  //   if (!user || user.role !== "ADMIN") {
  //     return res.status(401).json({ error: "Unauthorized" });
  //   }

  // อัปเดต Supplier
  if (req.method === "PATCH") {
    const { companyName, productName, stock, unitPrice } = req.body;
    try {
      const updated = await prisma.supplier.update({
        where: { id: id as string },
        data: {
          companyName,
          productName,
          stock: Number(stock),
          unitPrice: Number(unitPrice),
        },
      });
      return res.status(200).json(updated);
    } catch (err) {
      console.error("Update supplier error:", err);
      return res.status(500).json({ error: "Cannot update supplier" });
    }
  }

  // ลบ Supplier
  if (req.method === "DELETE") {
    try {
      await prisma.supplier.delete({ where: { id: id as string } });
      return res.status(204).end();
    } catch (err) {
      console.error("Delete supplier error:", err);
      return res.status(500).json({ error: "Cannot delete supplier" });
    }
  }

  res.setHeader("Allow", ["PATCH", "DELETE"]);
  return res.status(405).end();
}
