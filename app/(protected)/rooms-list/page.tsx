import { prisma } from "@/lib/db";
import { RoomFilters } from "./components/room-filters";

export default async function RoomsList() {
  // Fetch all rooms
  const rooms = await prisma.room.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="container mx-auto p-6">
      <RoomFilters allRooms={rooms} />
    </div>
  );
}

