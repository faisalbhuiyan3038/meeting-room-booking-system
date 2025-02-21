'use client';

import { useQuery, useMutation, useQueryClient } from "react-query";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PageLoadingSpinner } from "@/app/components/loading-spinner";
import { Room, RoomStatus, Booking, BookingStatus } from "@prisma/client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Building2, CalendarRange } from "lucide-react";

interface BookingWithRoom extends Booking {
  room: Room;
}

interface RoomFormData {
  name: string;
  capacity: number;
  description?: string;
  status: RoomStatus;
  amenities: string[];
}

interface BookingFormData {
  startTime: Date;
  endTime: Date;
  purpose: string | null;
  roomId: string;
  status: BookingStatus;
}

type AdminSection = 'main' | 'rooms' | 'bookings';

async function fetchRooms(): Promise<Room[]> {
  const response = await fetch('/api/rooms');
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  return response.json();
}

async function createRoom(data: RoomFormData): Promise<Room> {
  const response = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create room');
  }
  return response.json();
}

async function updateRoom(id: string, data: Partial<RoomFormData>): Promise<Room> {
  const response = await fetch(`/api/rooms/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update room');
  }
  return response.json();
}

async function deleteRoom(id: string): Promise<void> {
  const response = await fetch(`/api/rooms/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete room');
  }
}

async function fetchBookings(): Promise<BookingWithRoom[]> {
  const response = await fetch('/api/bookings/admin');
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  return response.json();
}

async function updateBooking(id: string, data: Partial<BookingFormData>): Promise<Booking> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update booking');
  }
  return response.json();
}

async function deleteBooking(id: string): Promise<void> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete booking');
  }
}

export default function AdminDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSection, setCurrentSection] = useState<AdminSection>('main');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    capacity: 0,
    description: '',
    status: 'ACTIVE',
    amenities: [],
  });
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    startTime: new Date(),
    endTime: new Date(),
    purpose: null,
    roomId: '',
    status: 'CONFIRMED',
  });

  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery<Room[]>(['admin-rooms'], fetchRooms, {
    enabled: currentSection === 'rooms' || currentSection === 'bookings',
  });

  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery<BookingWithRoom[]>(
    ['admin-bookings'],
    fetchBookings,
    {
      enabled: currentSection === 'bookings',
    }
  );

  const createMutation = useMutation(createRoom, {
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-rooms']);
      setIsCreating(false);
      setFormData({
        name: '',
        capacity: 0,
        description: '',
        status: 'ACTIVE',
        amenities: [],
      });
      toast.success('Room created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<RoomFormData> }) => updateRoom(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-rooms']);
        setIsEditing(null);
        toast.success('Room updated successfully');
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }
  );

  const deleteMutation = useMutation(deleteRoom, {
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-rooms']);
      toast.success('Room deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateBookingMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<BookingFormData> }) => updateBooking(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-bookings']);
        setIsEditing(null);
        toast.success('Booking updated successfully');
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }
  );

  const deleteBookingMutation = useMutation(deleteBooking, {
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-bookings']);
      toast.success('Booking deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoaded && !isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  if (isLoadingRooms || isLoadingBookings || !isLoaded) {
    return <PageLoadingSpinner />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate({ id: isEditing, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (room: Room) => {
    setIsEditing(room.id);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      description: room.description || '',
      status: room.status,
      amenities: room.amenities as string[],
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      deleteMutation.mutate(id);
    }
  };

  if (currentSection === 'main') {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setCurrentSection('rooms')}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <Building2 className="w-12 h-12 mb-4 text-blue-500" />
            <h2 className="text-xl font-semibold">Modify Room Data</h2>
            <p className="text-gray-600 text-center mt-2">Manage meeting rooms, their status, and amenities</p>
          </button>

          <button
            onClick={() => setCurrentSection('bookings')}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <CalendarRange className="w-12 h-12 mb-4 text-green-500" />
            <h2 className="text-xl font-semibold">Modify Booking Data</h2>
            <p className="text-gray-600 text-center mt-2">Manage room bookings and reservations</p>
          </button>
        </div>
      </div>
    );
  }

  if (currentSection === 'rooms') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => setCurrentSection('main')}
              className="text-blue-500 hover:text-blue-700 mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-semibold">Room Management</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add New Room
          </button>
        </div>

        {(isCreating || isEditing) && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Room' : 'Create New Room'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amenities</label>
                <input
                  type="text"
                  value={formData.amenities.join(', ')}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value.split(',').map(item => item.trim()) })}
                  placeholder="Enter amenities separated by commas"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(null);
                    setIsCreating(false);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{room.name}</h2>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-sm ${room.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    room.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {room.status}
                  </span>
                  <button
                    onClick={() => handleEdit(room)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600">Capacity: {room.capacity} people</p>
              <p className="text-sm text-gray-500 mt-2">{room.description}</p>
              {room.amenities && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Amenities: {(room.amenities as string[]).join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentSection === 'bookings') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setCurrentSection('main')}
            className="text-blue-500 hover:text-blue-700 mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-semibold ml-4">Booking Management</h1>
        </div>

        {isEditing && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Booking</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateBookingMutation.mutate({ id: isEditing, data: bookingFormData });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="datetime-local"
                  value={bookingFormData.startTime.toISOString().slice(0, 16)}
                  onChange={(e) => setBookingFormData({
                    ...bookingFormData,
                    startTime: new Date(e.target.value)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="datetime-local"
                  value={bookingFormData.endTime.toISOString().slice(0, 16)}
                  onChange={(e) => setBookingFormData({
                    ...bookingFormData,
                    endTime: new Date(e.target.value)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purpose</label>
                <textarea
                  value={bookingFormData.purpose || ''}
                  onChange={(e) => setBookingFormData({
                    ...bookingFormData,
                    purpose: e.target.value || null
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  placeholder="Enter booking purpose (minimum 10 characters)"
                  minLength={10}
                />
                {bookingFormData.purpose && bookingFormData.purpose.length < 10 && (
                  <p className="mt-1 text-sm text-red-600">
                    Purpose must be at least 10 characters long
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room</label>
                <select
                  value={bookingFormData.roomId}
                  onChange={(e) => setBookingFormData({
                    ...bookingFormData,
                    roomId: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={bookingFormData.status}
                  onChange={(e) => setBookingFormData({
                    ...bookingFormData,
                    status: e.target.value as BookingStatus
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {booking.room.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-sm ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                    {booking.status}
                  </span>
                  <button
                    onClick={() => {
                      setIsEditing(booking.id);
                      setBookingFormData({
                        startTime: new Date(booking.startTime),
                        endTime: new Date(booking.endTime),
                        purpose: booking.purpose,
                        roomId: booking.roomId,
                        status: booking.status,
                      });
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this booking?')) {
                        deleteBookingMutation.mutate(booking.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{booking.purpose}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
