// pages/api/auth/logout.ts
import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // ล้าง HTTP-only cookie
  res.setHeader(
    "Set-Cookie",
    serialize("token", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  );
  res.status(200).json({ ok: true });
}
