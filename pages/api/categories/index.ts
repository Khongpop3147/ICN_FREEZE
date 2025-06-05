//\pages\api\categories\index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // ดึงหมวดหมู่ทั้งหมด
    const cats = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return res.status(200).json(cats);
  }

  if (req.method === "POST") {
    // สร้างหมวดหมู่ใหม่
    const { name } = req.body as { name: string };
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "ต้องระบุชื่อหมวดหมู่" });
    }
    try {
      const cat = await prisma.category.create({ data: { name } });
      return res.status(201).json(cat);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
