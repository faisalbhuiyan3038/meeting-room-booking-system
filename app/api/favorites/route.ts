import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
    });
    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { roomId } = await request.json();

    // Check if favorite already exists
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.userFavorite.delete({
        where: {
          userId_roomId: {
            userId,
            roomId,
          },
        },
      });
      return NextResponse.json({ action: 'removed' });
    } else {
      await prisma.userFavorite.create({
        data: {
          userId,
          roomId,
        },
      });
      return NextResponse.json({ action: 'added' });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
