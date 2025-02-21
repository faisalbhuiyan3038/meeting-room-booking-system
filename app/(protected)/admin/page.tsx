'use client';

import { useQuery } from "react-query";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PageLoadingSpinner } from "@/app/components/loading-spinner";
import { Room } from "@prisma/client";

async function fetchRooms(): Promise<Room[]> {
  const response = await fetch('/api/rooms');
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  return response.json();
}

export default function AdminDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const { data: rooms = [], isLoading } = useQuery<Room[]>(['admin-rooms'], fetchRooms);

  if (isLoaded && !isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  if (isLoading || !isLoaded) {
    return <PageLoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{room.name}</h2>
              <span className={`px-2 py-1 rounded text-sm ${room.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                room.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                {room.status}
              </span>
            </div>
            <p className="text-gray-600">Capacity: {room.capacity} people</p>
            <p className="text-sm text-gray-500 mt-2">{room.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
