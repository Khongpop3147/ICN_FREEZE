// pages/api/products/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { prisma } from "@/lib/prisma";

export const config = { api: { bodyParser: false } };

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads/products",
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise<void>((resolve, reject) =>
    fn(req, res, (err: any) => (err ? reject(err) : resolve()))
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, upload.single("image"));

  if (req.method === "GET") {
    const items = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    const file = (req as any).file as Express.Multer.File | undefined;
    const { name, description, price, salePrice, stock, categoryId } = req.body;
    if (!file) return res.status(400).json({ error: "ต้องระบุรูป" });

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stock: parseInt(stock, 10),
        imageUrl: `/uploads/products/${file.filename}`,
        category: { connect: { id: categoryId } },
      },
    });
    return res.status(201).json(newProduct);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
