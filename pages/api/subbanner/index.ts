// pages/api/subbanner/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const sub = await prisma.subBanner.findFirst();
    return res.status(200).json(sub);
  }

  if (req.method === "PUT") {
    const { title, description, buttonText, buttonLink } = req.body;
    const existing = await prisma.subBanner.findFirst();
    const updated = await prisma.subBanner.upsert({
      where: { id: existing?.id ?? "" },
      create: { title, description, buttonText, buttonLink },
      update: { title, description, buttonText, buttonLink },
    });
    return res.status(200).json(updated);
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  res.status(405).end();
}
