// pages/api/faqs/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // ดึง FAQ ทั้งหมด
    const faqs = await prisma.faq.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ faqs });
  }

  if (req.method === "POST") {
    const { question } = req.body as { question: string };
    if (!question?.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }
    const faq = await prisma.faq.create({ data: { question } });
    return res.status(201).json(faq);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
