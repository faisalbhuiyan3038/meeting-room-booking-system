import { prisma } from "@/lib/db";
import { RoomFilters } from "./components/room-filters";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RoomsList() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch all rooms
  const rooms = await prisma.room.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  // Fetch user's favorites
  const userFavorites = await prisma.userFavorite.findMany({
    where: {
      userId: userId,
    },
  });

  return (
    <div className="container mx-auto p-6">
      <RoomFilters allRooms={rooms} userFavorites={userFavorites} />
    </div>
  );
}

