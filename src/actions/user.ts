
// actions/user.ts
import {prisma } from "@/lib/prisma";  // Adjust the import based on your file structure
import { Prisma } from "@prisma/client";

interface CreateUserInput {
  fullname: string;
  clerkId: string;
  type: string;
  stripeId: string;
}

export async function createUser({ fullname, clerkId, type, stripeId }: CreateUserInput) {
  try {
    // Attempt to create a new user in the database
    const user = await prisma.user.create({
      data: {
        fullname,
        clerkId,
        type,
        stripeId: stripeId || null, // If stripeId is empty, set it to null
      },
    });

    console.log("User created:", user);
    return user;  // Return the created user object
  } catch (error) {
    console.error("Error creating user:", error);
    return null;  // Return null or throw an error based on your needs
  }
}
