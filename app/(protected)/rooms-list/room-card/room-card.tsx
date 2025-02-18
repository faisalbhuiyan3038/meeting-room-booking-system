import { Amenity, amenityIcons } from "../config/amenities";
import { RoomStatus } from "@prisma/client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users } from "lucide-react";

interface RoomCardProps {
  name: string;
  imageUrl: string | null;
  capacity: number;
  status: RoomStatus;
  description: string | null;
  amenities: Amenity[];
}

const statusColors = {
  ACTIVE: "bg-green-500",
  MAINTENANCE: "bg-yellow-500",
  INACTIVE: "bg-red-500",
};

const RoomCard = ({
  name,
  imageUrl,
  capacity,
  status,
  description,
  amenities,
}: RoomCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || "/rooms/placeholder-room.jpg"}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{name}</h3>
          <Badge
            variant="secondary"
            className={`${statusColors[status]} text-white`}
          >
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Capacity: {capacity} people
          </span>
        </div>

        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity) => {
            const Icon = amenityIcons[amenity];
            return (
              <div
                key={amenity}
                className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs text-gray-600">
                  {amenity
                    .split(/(?=[A-Z])/)
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;

