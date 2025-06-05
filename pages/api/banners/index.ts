// pages/api/banners/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { prisma } from "@/lib/prisma";

// 1) ปิด bodyParser ของ Next.js เพื่อให้ multer อ่าน multipart/form-data ได้
export const config = { api: { bodyParser: false } };

// 2) ตั้งค่า multer ให้บันทึกรูปลง public/uploads/banners
const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads/banners",
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาด 5MB
});

// 3) wrapper ให้ multer ทำงานแบบ promise-friendly
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
): Promise<void> {
  return new Promise((resolve, reject) =>
    fn(req, res, (err: any) => (err ? reject(err) : resolve()))
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // เรียก multer middleware ก่อนเสมอ (สำหรับ POST ที่มี image)
  await runMiddleware(req, res, upload.single("image"));

  // อ่าน position จาก query string (เช่น ?position=hero หรือ ?position=sub)
  const posQuery = Array.isArray(req.query.position)
    ? req.query.position[0]
    : req.query.position;

  if (req.method === "GET") {
    // GET /api/banners → คืนรายการ banner (กรองตาม position ถ้ามี)
    const whereClause = posQuery ? { position: posQuery } : {}; // ถ้าไม่มี query ก็ return ทั้งหมด

    const banners = await prisma.banner.findMany({
      where: whereClause,
      orderBy: { order: "asc" },
    });
    return res.status(200).json({ items: banners });
  }

  if (req.method === "POST") {
    // POST /api/banners → สร้าง banner ใหม่
    const file = (req as any).file as Express.Multer.File | undefined;
    const { title, sub, description, order, position } = req.body as {
      title?: string;
      sub?: string;
      description?: string;
      order?: string;
      position?: string;
    };

    if (!file) {
      return res.status(400).json({ error: "ต้องระบุรูปภาพ (field: image)" });
    }

    const imageUrl = `/uploads/banners/${file.filename}`;
    const orderNum = parseInt(order ?? "0", 10) || 0;
    const positionValue = (position?.trim() || "hero") as string;

    try {
      const banner = await prisma.banner.create({
        data: {
          title: title?.trim() || null,
          sub: sub?.trim() || null,
          description: description?.trim() || null, // ← added
          imageUrl,
          order: orderNum,
          position: positionValue,
        },
      });
      return res.status(201).json(banner);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Method not allowed
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
