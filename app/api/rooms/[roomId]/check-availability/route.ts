import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { addMinutes } from 'date-fns';

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const { startTime } = await request.json();
    const startDateTime = new Date(startTime);
    const endDateTime = addMinutes(startDateTime, 30); // 30-minute slot

    // Check for any overlapping bookings
    const existingBooking = await prisma.booking.findFirst({
      where: {
        roomId: params.roomId,
        status: 'CONFIRMED',
        OR: [
          {
            // Booking starts during our slot
            AND: {
              startTime: {
                gte: startDateTime,
                lt: endDateTime,
              },
            },
          },
          {
            // Booking ends during our slot
            AND: {
              endTime: {
                gt: startDateTime,
                lte: endDateTime,
              },
            },
          },
          {
            // Booking encompasses our slot
            AND: {
              startTime: {
                lte: startDateTime,
              },
              endTime: {
                gte: endDateTime,
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({
      available: !existingBooking,
      existingBooking: existingBooking ? {
        startTime: existingBooking.startTime,
        endTime: existingBooking.endTime,
      } : null
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
