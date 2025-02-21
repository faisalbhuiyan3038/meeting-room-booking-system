'use client';

import { useQuery } from "react-query";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PageLoadingSpinner } from "@/app/components/loading-spinner";
import { Booking, Room } from "@prisma/client";

interface BookingWithRoom extends Booking {
  room: Room;
}

async function fetchBookings(): Promise<BookingWithRoom[]> {
  const response = await fetch('/api/bookings');
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  return response.json();
}

export default function MyBookings() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const { data: bookings = [], isLoading } = useQuery<BookingWithRoom[]>(['bookings'], fetchBookings);

  if (isLoaded && !isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  if (isLoading || !isLoaded) {
    return <PageLoadingSpinner />;
  }

  if (bookings.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">My Bookings</h1>
        <p className="text-gray-600">You don&apos;t have any bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">My Bookings</h1>
      <div className="grid gap-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold">{booking.room.name}</h2>
            <p className="text-gray-600">
              {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">{booking.purpose}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


