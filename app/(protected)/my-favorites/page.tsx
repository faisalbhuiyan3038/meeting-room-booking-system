'use client';

import { useQuery } from "react-query";
import RoomCard from "../rooms-list/room-card/room-card";
import { Amenity } from "../rooms-list/config/amenities";
import { PageLoadingSpinner } from "@/app/components/loading-spinner";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Room } from "@prisma/client";

interface FavoriteWithRoom {
  room: Room;
}

async function fetchFavorites(): Promise<FavoriteWithRoom[]> {
  const response = await fetch('/api/favorites/with-rooms');
  if (!response.ok) {
    throw new Error('Failed to fetch favorites');
  }
  return response.json();
}

export default function MyFavorites() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const { data: favorites = [], isLoading } = useQuery<FavoriteWithRoom[]>(['favorites-with-rooms'], fetchFavorites);

  if (isLoaded && !isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  if (isLoading || !isLoaded) {
    return <PageLoadingSpinner />;
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">My Favorites</h1>
        <p className="text-gray-600">You haven&apos;t favorited any rooms yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">My Favorites</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map(({ room }: FavoriteWithRoom) => (
          <RoomCard
            key={room.id}
            id={room.id}
            name={room.name}
            imageUrl={room.imageUrl}
            capacity={room.capacity}
            status={room.status}
            description={room.description}
            amenities={room.amenities as Amenity[]}
            isFavorite={true}
            onToggleFavorite={() => { }}
          />
        ))}
      </div>
    </div>
  );
}

