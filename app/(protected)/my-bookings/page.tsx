'use client';

import { useQuery, useMutation, useQueryClient } from "react-query";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PageLoadingSpinner } from "@/app/components/loading-spinner";
import { Booking, Room } from "@prisma/client";

interface BookingWithRoom extends Booking {
  room: Room;
}

async function fetchBookings(): Promise<BookingWithRoom[]> {
  const response = await fetch('/api/bookings');
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  return response.json();
}

async function cancelBooking(bookingId: string): Promise<BookingWithRoom> {
  const response = await fetch(`/api/bookings/${bookingId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'CANCELLED' }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel booking');
  }

  return response.json();
}

export default function MyBookings() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery<BookingWithRoom[]>(
    ['bookings'],
    fetchBookings,
    {
      enabled: isLoaded && isSignedIn,
    }
  );

  const cancelMutation = useMutation(
    (bookingId: string) => cancelBooking(bookingId),
    {
      onMutate: async (bookingId) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(['bookings']);

        // Snapshot the previous value
        const previousBookings = queryClient.getQueryData<BookingWithRoom[]>(['bookings']);

        // Optimistically update to the new value
        queryClient.setQueryData<BookingWithRoom[]>(['bookings'], (old) => {
          if (!old) return [];
          return old.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: 'CANCELLED' }
              : booking
          );
        });

        // Return a context object with the snapshotted value
        return { previousBookings };
      },
      onError: (err, bookingId, context) => {
        // If the mutation fails, use the context returned from onMutate to roll back
        if (context?.previousBookings) {
          queryClient.setQueryData(['bookings'], context.previousBookings);
        }
        alert('Failed to cancel booking. Please try again.');
      },
      onSettled: () => {
        // Always refetch after error or success to ensure we have the correct data
        queryClient.invalidateQueries(['bookings']);
      },
    }
  );

  const handleEdit = (bookingId: string) => {
    router.push(`/edit-booking/${bookingId}`);
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    cancelMutation.mutate(bookingId);
  };

  if (isLoaded && !isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  if (isLoading || !isLoaded) {
    return <PageLoadingSpinner />;
  }

  if (bookings.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">My Bookings</h1>
        <p className="text-gray-600">You don&apos;t have any bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">My Bookings</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map((booking) => {
              const startDate = new Date(booking.startTime);
              const endDate = new Date(booking.endTime);

              return (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.room.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {startDate.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {startDate.toLocaleTimeString()} - {endDate.toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {booking.status === 'CONFIRMED' && (
                      <>
                        <button
                          onClick={() => handleEdit(booking.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={cancelMutation.isLoading}
                        >
                          {cancelMutation.isLoading ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


