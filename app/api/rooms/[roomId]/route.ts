import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

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
