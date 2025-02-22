import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Ensure user is admin before proceeding
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const bookings = await prisma.booking.findMany({
      include: {
        room: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('[ADMIN_BOOKINGS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
