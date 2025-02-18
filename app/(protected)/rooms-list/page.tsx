import { prisma } from "@/lib/db";
import RoomCard from "./room-card/room-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/app/components/ui/multi-select";
import { RoomStatus } from "@prisma/client";
import { amenityOptions, Amenity } from "./config/amenities";

const capacityOptions = [
  { label: "Up to 5 people", value: "5" },
  { label: "Up to 10 people", value: "10" },
  { label: "Up to 20 people", value: "20" },
  { label: "Up to 50 people", value: "50" },
];

export default async function RoomsList() {
  const rooms = await prisma.room.findMany({
    where: {
      status: "ACTIVE",
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <Select defaultValue="5">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select capacity" />
          </SelectTrigger>
          <SelectContent>
            {capacityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <MultiSelect
          options={amenityOptions}
          placeholder="Select amenities"
          className="w-[250px]"
        />

        <Select defaultValue="ACTIVE">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(RoomStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

