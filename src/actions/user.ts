
"use server";

import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

interface CreateUserInput {
  fullname: string;
  clerkId: string;
  type: string;
  stripeId: string;
}

export async function createUserInDB({
  fullname,
  clerkId,
  type,
  stripeId,
}: CreateUserInput): Promise<User> {

  const existingUser = await prisma.user.findFirst({
    where: { clerkId },
  });

  if (existingUser) {
    return existingUser;
  }


  const newUser = await prisma.user.create({
    data: {
      fullname,
      clerkId,
      type,
      stripeId,
    },
  });

  return newUser;
}