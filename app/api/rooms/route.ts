import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const roomCreateSchema = z.object({
  name: z.string().min(3),
  capacity: z.number().min(1),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']).default('ACTIVE'),
  amenities: z.array(z.string()),
  imageUrl: z.string().url().optional(),
});

// Middleware to check if user is admin
async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === 'ADMIN';
}

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is admin
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = roomCreateSchema.parse(body);

    const room = await prisma.room.create({
      data: validatedData,
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid room data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
