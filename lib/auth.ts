// lib/auth.ts
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment");
}

interface JwtPayload {
  userId: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * ตรวจสอบและถอดรหัส JWT token
 * คืนค่า payload หรือ null ถ้าไม่ถูกต้อง
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    // ถ้ามี prefix “Bearer ” ให้ strip ออกก่อน
    const raw = token.startsWith("Bearer ") ? token.slice(7) : token;
    const payload = jwt.verify(raw, JWT_SECRET) as JwtPayload;
    return payload;
  } catch (err) {
    console.error("JWT verify failed:", err);
    return null;
  }
}

/**
 * ดึง user จาก Authorization header แบบ Bearer token
 * คืนค่า User หรือ null ถ้าไม่พบ หรือ token ไม่ถูกต้อง
 */
export async function getUserFromToken(
  authHeader: string | undefined
): Promise<User | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring("Bearer ".length);
  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });
  return user;
}
