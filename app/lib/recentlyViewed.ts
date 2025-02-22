import { Room } from "@prisma/client";

const STORAGE_KEY = 'recently-viewed-rooms';
const MAX_RECENT_ROOMS = 5;

export interface RecentRoom {
  id: string;
  name: string;
  imageUrl: string | null;
  viewedAt: number;
}

export function addRecentlyViewedRoom(room: Pick<Room, 'id' | 'name' | 'imageUrl'>) {
  try {
    const recentRooms = getRecentlyViewedRooms();

    // Remove if already exists
    const filteredRooms = recentRooms.filter(r => r.id !== room.id);

    // Add to beginning of array with current timestamp
    const updatedRooms = [
      { ...room, viewedAt: Date.now() },
      ...filteredRooms
    ].slice(0, MAX_RECENT_ROOMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRooms));
  } catch (error) {
    console.error('Error saving recently viewed room:', error);
  }
}

export function getRecentlyViewedRooms(): RecentRoom[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error getting recently viewed rooms:', error);
    return [];
  }
}
