import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { createUser } from "@/actions/user"; // Ensure createUser function is correctly implemented

export async function POST(req: Request) {
  try {
    const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    // Check if the Clerk webhook secret exists
    if (!CLERK_WEBHOOK_SECRET) {
      console.error("❌ Error: CLERK_WEBHOOK_SECRET is missing.");
      return NextResponse.json({ error: "Missing secret" }, { status: 500 });
    }

    const wh = new Webhook(CLERK_WEBHOOK_SECRET);

    // Await headers() before calling .get()
    const headerPayload = await headers();

    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // Ensure all required headers are present
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
    }

    // Parse the incoming request body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Verify the webhook
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    // Log the event type and data for debugging
    console.log(`✅ Received webhook with type: ${evt.type}`);
    console.log(`📌 Webhook payload:`, evt.data);

    // Handle specific events (e.g., user.created)
    if (evt.type === "user.created") {
      const userData = evt.data;
      console.log(`🆕 New user created with Clerk ID: ${userData.id}`);

      // Call the createUser function (ensure this is correctly implemented)
      const newUser = await createUser({
        fullname: `${userData.first_name} ${userData.last_name}`,
        clerkId: userData.id,
        type: "user",
        stripeId: "", // Assuming stripeId is empty or can be set later
      });

      // Handle the result of the user creation process
      if (newUser) {
        console.log("✅ User stored in database successfully.");
      } else {
        console.log("⚠️ User could not be saved.");
      }
    }

    // Always return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook processing failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


