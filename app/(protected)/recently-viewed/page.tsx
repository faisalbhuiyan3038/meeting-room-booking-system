'use client';

import { useEffect, useState } from 'react';
import { getRecentlyViewedRooms, RecentRoom } from '@/app/lib/recentlyViewed';
import RoomCard from '../rooms-list/room-card/room-card';
import { RoomStatus } from '@prisma/client';

export default function RecentlyViewedPage() {
  const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([]);

  useEffect(() => {
    const rooms = getRecentlyViewedRooms();
    setRecentRooms(rooms);
  }, []);

  if (recentRooms.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Recently Viewed Rooms</h1>
        <p className="text-gray-600">No recently viewed rooms yet. Start browsing rooms to see them here!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Recently Viewed Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentRooms.map((room) => (
          <RoomCard
            key={room.id}
            id={room.id}
            name={room.name}
            imageUrl={room.imageUrl}
            capacity={0}
            showCapacity={false}
            status={RoomStatus.ACTIVE}
            description={null}
            amenities={[]}
          />
        ))}
      </div>
    </div>
  );
}
