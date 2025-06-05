import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

type CategorySalesItem = { category: string; totalSales: number };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CategorySalesItem[] | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const raw = await prisma.$queryRaw<CategorySalesItem[]>`
    SELECT
      c.name AS category,
      SUM(oi.quantity * oi."priceAtPurchase")::float AS "totalSales"
    FROM "OrderItem" oi
    JOIN "Product" p ON p.id = oi."productId"
    JOIN "Category" c ON c.id = p."categoryId"
    GROUP BY c.name
    ORDER BY c.name;
  `;

  res.status(200).json(raw);
}
