import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const roomUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  capacity: z.number().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']).optional(),
  amenities: z.array(z.string()).optional(),
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

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: {
        id: params.roomId,
      },
    });

    if (!room) {
      return new NextResponse('Room not found', { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    // Check if user is admin
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = roomUpdateSchema.parse(body);

    const room = await prisma.room.update({
      where: {
        id: params.roomId,
      },
      data: validatedData,
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid room data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    // Check if user is admin
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if there are any active bookings for this room
    const activeBookings = await prisma.booking.findFirst({
      where: {
        roomId: params.roomId,
        status: 'CONFIRMED',
        endTime: {
          gt: new Date(),
        },
      },
    });

    if (activeBookings) {
      return NextResponse.json(
        { error: 'Cannot delete room with active bookings' },
        { status: 400 }
      );
    }

    await prisma.room.delete({
      where: {
        id: params.roomId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
