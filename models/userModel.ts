// models/userModel.ts
import { prisma } from "../lib/prisma";
import type { User } from "@prisma/client";

export function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  return prisma.user.create({ data });
}
