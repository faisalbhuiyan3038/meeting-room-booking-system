import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createBookingSchema = z.object({
  title: z.string().min(3),
  purpose: z.string().min(10),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  roomId: z.string(),
  attendees: z.number().min(1),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createBookingSchema.parse(body);

    // Check if room exists and has enough capacity
    const room = await prisma.room.findUnique({
      where: { id: validatedData.roomId },
    });

    if (!room) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      );
    }

    if (validatedData.attendees > room.capacity) {
      return NextResponse.json(
        { message: `Number of attendees cannot exceed room capacity of ${room.capacity}` },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        roomId: validatedData.roomId,
        status: 'CONFIRMED',
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(validatedData.startTime) } },
              { endTime: { gt: new Date(validatedData.startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(validatedData.endTime) } },
              { endTime: { gte: new Date(validatedData.endTime) } },
            ],
          },
        ],
      },
    });

    if (overlappingBooking) {
      return NextResponse.json(
        { message: 'This time slot is already booked' },
        { status: 409 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        ...validatedData,
        userId,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid booking data', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
