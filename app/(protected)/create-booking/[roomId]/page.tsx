'use client';

import { useQuery } from 'react-query';
import { Room } from '@prisma/client';
import Image from 'next/image';
import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

async function fetchRoom(roomId: string): Promise<Room> {
  const response = await fetch(`/api/rooms/${roomId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch room');
  }
  return response.json();
}

export default function CreateBooking({ params }: { params: { roomId: string } }) {
  const { data: room, isLoading, error } = useQuery<Room>(
    ['room', params.roomId],
    () => fetchRoom(params.roomId),
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-32 w-48 rounded-lg" />
            <div className="flex-grow">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <div className="text-center text-red-500">
            Error loading room information. Please try again later.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative h-32 w-48 flex-shrink-0">
            <Image
              src={room.imageUrl || "/rooms/placeholder-room.jpg"}
              alt={room.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="flex-grow">
            <h1 className="text-2xl font-semibold mb-2">{room.name}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-5 w-5" />
              <span>Capacity: {room.capacity} people</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Booking form will be added here later */}
    </div>
  );
}
