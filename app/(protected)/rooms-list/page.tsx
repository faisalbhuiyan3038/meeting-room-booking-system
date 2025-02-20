'use client';

import { useQuery, useMutation, useQueryClient } from "react-query";
import { RoomFilters } from "./components/room-filters";
import { Room, UserFavorite } from "@prisma/client";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

async function fetchRooms(): Promise<Room[]> {
  const response = await fetch('/api/rooms');
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  return response.json();
}

async function fetchFavorites(): Promise<UserFavorite[]> {
  const response = await fetch('/api/favorites');
  if (!response.ok) {
    throw new Error('Failed to fetch favorites');
  }
  return response.json();
}

async function toggleFavorite(roomId: string): Promise<{ action: 'added' | 'removed' }> {
  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ roomId }),
  });
  if (!response.ok) {
    throw new Error('Failed to toggle favorite');
  }
  return response.json();
}

export default function RoomsList() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: rooms, isLoading: isLoadingRooms } = useQuery<Room[]>(['rooms'], fetchRooms);
  const { data: favorites, isLoading: isLoadingFavorites } = useQuery<UserFavorite[]>(
    ['favorites'],
    fetchFavorites,
    { enabled: isSignedIn }
  );

  const toggleFavoriteMutation = useMutation(toggleFavorite, {
    onMutate: async (roomId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['favorites']);

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<UserFavorite[]>(['favorites']);

      // Optimistically update favorites
      if (previousFavorites) {
        const exists = previousFavorites.some(fav => fav.roomId === roomId);
        if (exists) {
          queryClient.setQueryData<UserFavorite[]>(['favorites'],
            previousFavorites.filter(fav => fav.roomId !== roomId)
          );
        } else {
          queryClient.setQueryData<UserFavorite[]>(['favorites'], [
            ...previousFavorites,
            { roomId, userId: '', id: 'temp-' + roomId, createdAt: new Date() }
          ]);
        }
      }

      return { previousFavorites };
    },
    onError: (err, roomId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries(['favorites']);
    },
  });

  // Redirect if not authenticated
  if (isLoaded && !isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  if (isLoadingRooms || (isSignedIn && isLoadingFavorites)) {
    return (
      <div className="container mx-auto p-6">
        <div>Loading...</div>
      </div>
    );
  }

  const handleToggleFavorite = (roomId: string) => {
    toggleFavoriteMutation.mutate(roomId);
  };

  return (
    <div className="container mx-auto p-6">
      <RoomFilters
        allRooms={rooms || []}
        userFavorites={favorites || []}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}

