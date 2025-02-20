"use client";

import { Amenity, amenityIcons } from "../config/amenities";
import { Room, RoomStatus } from "@prisma/client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQueryClient } from "react-query";

interface RoomCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  capacity: number;
  status: RoomStatus;
  description: string | null;
  amenities: Amenity[];
  isFavorite?: boolean;
  onToggleFavorite?: (roomId: string) => void;
}

interface RoomWithFavorite extends Room {
  isFavorite: boolean;
}

const statusColors = {
  ACTIVE: "bg-green-500",
  MAINTENANCE: "bg-yellow-500",
  INACTIVE: "bg-red-500",
};

const RoomCard = ({
  id,
  name,
  imageUrl,
  capacity,
  status,
  description,
  amenities,
  isFavorite = false,
  onToggleFavorite,
}: RoomCardProps) => {
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onToggleFavorite) return;

    // Optimistic update
    queryClient.setQueryData<RoomWithFavorite[]>(['rooms'], (oldData) => {
      if (!oldData) return [];
      return oldData.map((room) => {
        if (room.id === id) {
          return {
            ...room,
            isFavorite: !isFavorite
          };
        }
        return room;
      });
    });

    // Call the actual toggle function
    onToggleFavorite(id);
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || "/rooms/placeholder-room.jpg"}
          alt={name}
          fill
          className="object-cover"
        />
        {onToggleFavorite && (
          <Button
            onClick={handleFavoriteClick}
            className={`absolute top-2 right-2 p-2 rounded-full transition-opacity ${isHovered || isFavorite ? 'opacity-100' : 'opacity-0'
              } bg-white/80 hover:bg-white`}
            size="icon"
            variant="ghost"
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </Button>
        )}
      </div>

      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{name}</h3>
          <Badge
            variant="secondary"
            className={`${statusColors[status]} text-white hover:bg-green-500`}
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

