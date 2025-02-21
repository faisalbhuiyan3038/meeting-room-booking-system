'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageLoadingSpinner } from '@/app/components/loading-spinner';
import { Booking, Room } from '@prisma/client';

interface BookingWithRoom extends Booking {
  room: Room;
}

const editBookingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
});

type EditBookingForm = z.infer<typeof editBookingSchema>;

async function fetchBooking(id: string): Promise<BookingWithRoom> {
  const response = await fetch(`/api/bookings/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch booking');
  }
  return response.json();
}

async function updateBooking(id: string, data: EditBookingForm): Promise<BookingWithRoom> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update booking');
  }

  return response.json();
}

export default function EditBooking() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const bookingId = params.id as string;

  const { data: booking, isLoading: isLoadingBooking } = useQuery(
    ['booking', bookingId],
    () => fetchBooking(bookingId),
    {
      enabled: isLoaded && isSignedIn && !!bookingId,
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditBookingForm>({
    resolver: zodResolver(editBookingSchema),
    defaultValues: {
      title: booking?.title || '',
      purpose: booking?.purpose || '',
    },
  });

  // Reset form when booking data is loaded
  React.useEffect(() => {
    if (booking) {
      reset({
        title: booking.title,
        purpose: booking.purpose || '',
      });
    }
  }, [booking, reset]);

  const updateMutation = useMutation(
    (data: EditBookingForm) => updateBooking(bookingId, data),
    {
      onSuccess: () => {
        // Invalidate and refetch the bookings list and the single booking
        queryClient.invalidateQueries(['bookings']);
        queryClient.invalidateQueries(['booking', bookingId]);
        router.push('/my-bookings');
      },
      onError: (error) => {
        alert('Failed to update booking. Please try again.');
        console.error('Update error:', error);
      },
    }
  );

  const onSubmit = (data: EditBookingForm) => {
    updateMutation.mutate(data);
  };

  if (isLoaded && !isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  if (isLoadingBooking || !isLoaded) {
    return <PageLoadingSpinner />;
  }

  if (!booking) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Booking not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Edit Booking</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Meeting Name
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                Meeting Purpose
              </label>
              <textarea
                id="purpose"
                rows={3}
                {...register('purpose')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/my-bookings')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
