import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ตรวจ token และดึง user
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET /api/cart → ดึงรายการในตะกร้า
  if (req.method === "GET") {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    const items = cart?.items || [];
    return res.status(200).json({ items });
  }

  // POST /api/cart → เพิ่มหรืออัปเดตจำนวน (เพิ่มจำนวนเข้าไป)
  if (req.method === "POST") {
    const { productId, quantity } = req.body as {
      productId: string;
      quantity: number;
    };

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid productId or quantity" });
    }

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      item = await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    return res.status(200).json(item);
  }

  // PATCH /api/cart → อัปเดตจำนวนสินค้าแบบ set จำนวนใหม่
  if (req.method === "PATCH") {
    const { itemId, quantity } = req.body as {
      itemId: string;
      quantity: number;
    };

    if (!itemId || quantity === undefined || quantity < 1) {
      return res.status(400).json({ error: "Invalid itemId or quantity" });
    }

    try {
      const updatedItem = await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
      return res.status(200).json(updatedItem);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // DELETE /api/cart → ลบสินค้าออกจากตะกร้า
  if (req.method === "DELETE") {
    const { itemId } = req.body as { itemId?: string };
    if (!itemId) {
      return res.status(400).json({ error: "Missing itemId" });
    }
    try {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
