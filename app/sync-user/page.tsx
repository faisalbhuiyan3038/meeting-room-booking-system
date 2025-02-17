import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

const SyncUser = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      redirect("/sign-in");
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (!user.emailAddresses[0]?.emailAddress) {
      throw new Error("User email not found");
    }

    await prisma.user.upsert({
      where: {
        id: userId, // Using Clerk's userId as our primary key
      },
      update: {
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
      },
      create: {
        id: userId, // Using Clerk's userId as our primary key
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
      },
    });

    // Redirect to home page after successful sync
    redirect("/");
  } catch (error) {
    console.error("Error syncing user:", error);
  }
};

export default SyncUser;
