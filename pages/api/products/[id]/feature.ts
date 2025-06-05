// pages/api/products/[id]/feature.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).end();
  }

  const { isFeatured } = req.body as { isFeatured: boolean };

  try {
    const updated = await prisma.product.update({
      where: { id: id as string },
      data: { isFeatured },
    });
    return res.status(200).json(updated);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    return res.status(500).json({ error: "Cannot update featured status" });
  }
}
