import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import RoomCard from "../rooms-list/room-card/room-card";
import { Amenity } from "../rooms-list/config/amenities";

export default async function MyFavorites() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user's favorite rooms with room details
  const favorites = await prisma.userFavorite.findMany({
    where: {
      userId: userId,
    },
    include: {
      room: true,
    },
  });

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
        {favorites.map(({ room }) => (
          <RoomCard
            key={room.id}
            id={room.id}
            name={room.name}
            imageUrl={room.imageUrl}
            capacity={room.capacity}
            status={room.status}
            description={room.description}
            amenities={room.amenities as Amenity[]}
          />
        ))}
      </div>
    </div>
  );
}

