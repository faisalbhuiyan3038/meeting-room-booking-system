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
      include: {
        room: true,
      },
    });
    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites with rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites with rooms' }, { status: 500 });
  }
}
