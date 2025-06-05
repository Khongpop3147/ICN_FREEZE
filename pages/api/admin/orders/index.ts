// pages/api/orders/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { IncomingForm, File } from "formidable";
import fs from "fs";
import path from "path";

// ปิด built-in body parser เพื่อใช้ formidable
export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Cannot parse form data" });
    }

    try {
      // ตรวจสอบสิทธิ์
      const authHeader = req.headers.authorization;
      const user = await getUserFromToken(authHeader);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // helper ดึงค่าแรกจาก string | string[]
      const getFirst = (val: any): string =>
        Array.isArray(val) ? val[0] : val;

      // normalize ฟิลด์ข้อความ
      const recipient = getFirst(fields.recipient);
      const line1 = getFirst(fields.line1);
      const line2 = fields.line2 ? getFirst(fields.line2) : null;
      const line3 = fields.line3 ? getFirst(fields.line3) : null; // เพิ่ม line3
      const city = getFirst(fields.city);
      const postalCode = fields.postalCode ? getFirst(fields.postalCode) : null;
      const country = getFirst(fields.country);
      const paymentMethod = fields.paymentMethod
        ? getFirst(fields.paymentMethod)
        : null;
      const couponCodeRaw = fields.couponCode
        ? getFirst(fields.couponCode)
        : null;

      // parse items
      let items: {
        productId: string;
        quantity: number;
        priceAtPurchase: number;
      }[];
      const rawItems = fields.items;
      if (typeof rawItems === "string") {
        items = JSON.parse(rawItems);
      } else if (Array.isArray(rawItems) && typeof rawItems[0] === "string") {
        items = JSON.parse(rawItems[0]);
      } else {
        items = rawItems as any[];
      }

      // ตรวจสอบ stock ก่อน
      for (const item of items) {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true },
        });
        if (!prod) {
          return res
            .status(400)
            .json({ error: `ไม่พบสินค้า id: ${item.productId}` });
        }
        if (prod.stock < item.quantity) {
          return res
            .status(400)
            .json({ error: `สต็อกสินค้า ${prod.name} ไม่เพียงพอ` });
        }
      }

      // คำนวณยอดรวมก่อนหักส่วนลด
      const totalAmount = items.reduce(
        (sum, item) => sum + item.priceAtPurchase * item.quantity,
        0
      );

      // คำนวณส่วนลด
      let couponId: string | null = null;
      let discountValue = 0;
      if (couponCodeRaw) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: couponCodeRaw },
        });
        if (coupon) {
          couponId = coupon.id;
          discountValue = coupon.discountValue ?? 0;
          if (coupon.discountType === "percent") {
            discountValue = (totalAmount * discountValue) / 100;
          }
        }
      }
      const totalAfterDiscount = Math.max(totalAmount - discountValue, 0);

      // จัดการไฟล์สลิป (multipart) หรือ fallback URL text
      let slipUrl: string | null = null;
      const rawFileField = (files.slipFile ?? files.slipUrl) as
        | File
        | File[]
        | undefined;
      const rawFile = Array.isArray(rawFileField)
        ? rawFileField[0]
        : rawFileField;
      if (rawFile) {
        const uploadDir = path.join(process.cwd(), "public", "upload", "slips");
        await fs.promises.mkdir(uploadDir, { recursive: true });
        const ext = path.extname(rawFile.originalFilename || "");
        const filename = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}${ext}`;
        const dest = path.join(uploadDir, filename);
        await fs.promises.rename(rawFile.filepath, dest);
        slipUrl = `/upload/slips/${filename}`;
      }
      if (!slipUrl && fields.slipUrl && typeof fields.slipUrl === "string") {
        slipUrl = fields.slipUrl;
      }

      // สร้าง order และลด stock ใน transaction
      const [newOrder] = await prisma.$transaction([
        prisma.order.create({
          data: {
            userId: user.id,
            recipient,
            line1,
            line2,
            line3, // เก็บ line3 ลง DB
            city,
            postalCode,
            country,
            paymentMethod,
            slipUrl,
            totalAmount: totalAfterDiscount,
            couponId,
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: item.priceAtPurchase,
              })),
            },
          },
          include: { items: true },
        }),
        ...items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        ),
      ]);

      return res.status(201).json(newOrder);
    } catch (error) {
      console.error("Create order error:", error);
      return res
        .status(500)
        .json({ error: "เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ" });
    }
  });
}
