// pages/api/banners/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { IncomingForm, File } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // ปิด built-in parser เพื่อใช้ formidable
  },
};

type Parsed = {
  fields: Record<string, string>;
  files: Record<string, File>;
};

const parseForm = (req: NextApiRequest): Promise<Parsed> =>
  new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "banners");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
      multiples: false,
      uploadDir,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      // cast fields to string
      const flds: Record<string, string> = {};
      for (const key in fields) {
        const val = fields[key];
        flds[key] = Array.isArray(val) ? val[0] ?? "" : val ?? "";
      }
      // Normalize files: ensure each value is a single File, not File[]
      const normalizedFiles: Record<string, File> = {};
      for (const key in files) {
        const fileValue = files[key];
        if (Array.isArray(fileValue)) {
          normalizedFiles[key] = fileValue[0];
        } else if (fileValue) {
          normalizedFiles[key] = fileValue;
        }
      }
      resolve({ fields: flds, files: normalizedFiles });
    });
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const rawId = req.query.id;
  const id =
    typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : null;

  if (!id) {
    return res.status(400).json({ error: "Invalid banner id" });
  }

  // PUT: อัปเดตแบนเนอร์ (รองรับรูปใหม่และ position ด้วย)
  if (req.method === "PUT") {
    try {
      const { fields, files } = await parseForm(req);

      // แปลงค่า fields (รวม position)
      const title = fields.title?.trim() || null;
      const sub = fields.sub?.trim() || null;
      const order = parseInt(fields.order || "0", 10);
      const position = fields.position?.trim() || null;
      const description = fields.description?.trim();
      // เตรียม object สำหรับอัปเดต
      const data: any = { order };
      if (fields.hasOwnProperty("title")) data.title = title;
      if (fields.hasOwnProperty("sub")) data.sub = sub;
      if (position !== null) data.position = position;
      if (description !== null) data.description = description;
      // ถ้ามีรูปใหม่ อัปเดต imageUrl
      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        const tmpPath = (file.filepath || (file as any).path) as string;
        const fileName = path.basename(tmpPath);
        data.imageUrl = `/uploads/banners/${fileName}`;
      }

      const updated = await prisma.banner.update({
        where: { id },
        data,
      });

      return res.status(200).json(updated);
    } catch (err: any) {
      console.error("Update banner error:", err);
      return res
        .status(500)
        .json({ error: "เกิดข้อผิดพลาดในการแก้ไขแบนเนอร์" });
    }
  }

  // DELETE: ลบแบนเนอร์
  if (req.method === "DELETE") {
    try {
      await prisma.banner.delete({ where: { id } });
      return res.status(204).end();
    } catch (err: any) {
      console.error("Delete banner error:", err);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบแบนเนอร์" });
    }
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
