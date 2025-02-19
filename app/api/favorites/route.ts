import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { roomId } = await request.json();
    if (!roomId) {
      return new NextResponse("Room ID is required", { status: 400 });
    }

    // Check if the favorite already exists
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (existingFavorite) {
      // If it exists, remove it
      await prisma.userFavorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
    } else {
      // If it doesn't exist, create it
      await prisma.userFavorite.create({
        data: {
          userId,
          roomId,
        },
      });
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("Error in favorites API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
