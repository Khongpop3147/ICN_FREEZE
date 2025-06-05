// pages/api/faqs/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query as { id: string };

  if (req.method === "PATCH") {
    const { answer } = req.body as { answer: string };
    const updated = await prisma.faq.update({
      where: { id },
      data: { answer },
    });
    return res.status(200).json(updated);
  }

  res.setHeader("Allow", ["PATCH"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
