// lib/adminGuard.ts
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
export async function adminGuard<P>(
  ctx: GetServerSidePropsContext,
  fn: (ctx: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P>>
): Promise<GetServerSidePropsResult<P>> {
  const { req } = ctx;
  const token = req.cookies.token;
  if (!token) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.role !== "ADMIN") {
      throw new Error();
    }
    return await fn(ctx);
  } catch {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
}
