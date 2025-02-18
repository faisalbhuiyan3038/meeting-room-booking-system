import { prisma } from "@/lib/db";
import RoomCard from "./room-card/room-card";
import { RoomFilters } from "./components/room-filters";
import { Amenity } from "./config/amenities";

export default async function RoomsList() {
  const rooms = await prisma.room.findMany({
    where: {
      status: "ACTIVE",
    },
  });

  return (
    <div className="container mx-auto p-6">
      <RoomFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
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

