'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactSelect, { MultiValue } from "react-select";
import { amenityOptions, Amenity } from "../config/amenities";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Room, UserFavorite } from "@prisma/client";
import RoomCard from "../room-card/room-card";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Ensure the Option type matches the structure of amenityOptions
type AmenityOption = typeof amenityOptions[number];
type Option = AmenityOption;

const capacityOptions = [
  { label: "All capacities", value: "ALL" },
  { label: "Up to 5 people", value: "5" },
  { label: "Up to 10 people", value: "10" },
  { label: "Up to 20 people", value: "20" },
  { label: "Up to 50 people", value: "50" },
];

const statusOptions = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Maintenance", value: "MAINTENANCE" },
  { label: "Inactive", value: "INACTIVE" },
];

interface RoomFiltersProps {
  allRooms: Room[];
  userFavorites: UserFavorite[];
  onToggleFavorite: (roomId: string) => void;
}

export function RoomFilters({ allRooms, userFavorites, onToggleFavorite }: RoomFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filteredRooms, setFilteredRooms] = useState(allRooms);
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 5;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleCapacityChange = (value: string) => {
    router.push(`?${createQueryString('capacity', value)}`);
  };

  const handleStatusChange = (value: string) => {
    router.push(`?${createQueryString('status', value)}`);
  };

  const handleAmenitiesChange = (newValue: MultiValue<Option>) => {
    const amenities = newValue.map(v => v.value).join(',');
    router.push(`?${createQueryString('amenities', amenities)}`);
  };

  // Parse and validate amenities from URL
  const currentAmenities = searchParams.get('amenities')
    ? searchParams
      .get('amenities')!
      .split(',')
      .map(a => amenityOptions.find(opt => opt.value === a as Amenity))
      .filter((opt): opt is AmenityOption => opt !== undefined)
    : [];

  // Update filtered rooms whenever search params change
  useEffect(() => {
    let result = [...allRooms];

    const status = searchParams.get('status');
    if (status && status !== 'ALL') {
      result = result.filter(room => room.status === status);
    }

    const capacity = searchParams.get('capacity');
    if (capacity && capacity !== 'ALL') {
      const capValue = parseInt(capacity);
      result = result.filter(room => room.capacity <= capValue);
    }

    const amenities = searchParams.get('amenities');
    if (amenities) {
      const selectedAmenities = amenities.split(',');
      result = result.filter(room => {
        const roomAmenities = room.amenities as Amenity[];
        return selectedAmenities.every(amenity => roomAmenities.includes(amenity as Amenity));
      });
    }

    setFilteredRooms(result);
  }, [searchParams, allRooms]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const startIndex = (currentPage - 1) * roomsPerPage;
  const endIndex = startIndex + roomsPerPage;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams]);

  if (!allRooms) {
    return (
      <div className="container mx-auto p-6 min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select
          defaultValue={searchParams.get('capacity') || "ALL"}
          onValueChange={handleCapacityChange}
        >
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

        <Select
          defaultValue={searchParams.get('status') || "ALL"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ReactSelect<Option, true>
          isMulti
          options={amenityOptions}
          onChange={handleAmenitiesChange}
          placeholder="Select amenities"
          className="min-w-[200px]"
          value={currentAmenities}
        />

        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredRooms.length)} of {filteredRooms.length} rooms
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentRooms.map((room) => (
          <RoomCard
            key={room.id}
            id={room.id}
            name={room.name}
            imageUrl={room.imageUrl}
            capacity={room.capacity}
            status={room.status}
            description={room.description}
            amenities={room.amenities as Amenity[]}
            isFavorite={userFavorites.some(fav => fav.roomId === room.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2"
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
