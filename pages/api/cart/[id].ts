import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      await prisma.cartItem.delete({ where: { id: id as string } });
      return res.status(204).end();
    } catch (error) {
      return res.status(400).json({ error: "Cannot delete cart item" });
    }
  }

  res.setHeader("Allow", ["DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
