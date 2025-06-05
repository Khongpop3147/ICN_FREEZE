// pages/api/categories/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query as { id: string };

  if (req.method === "DELETE") {
    try {
      // ลบหมวดหมู่ โดย cascade constraint ถ้าต้องการ
      await prisma.category.delete({ where: { id } });
      return res.status(204).end(); // No Content
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
