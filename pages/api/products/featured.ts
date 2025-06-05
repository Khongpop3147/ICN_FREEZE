// pages/api/products/featured.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }

  try {
    const featured = await prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: { updatedAt: "desc" },
    });
    return res.status(200).json(featured);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return res.status(500).json({ error: "Cannot fetch featured products" });
  }
}
