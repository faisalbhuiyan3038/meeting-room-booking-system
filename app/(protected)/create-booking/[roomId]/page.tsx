'use client';

import { useQuery } from 'react-query';
import { Room } from '@prisma/client';
import Image from 'next/image';
import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { DayPicker } from 'react-day-picker';
import { format, addMinutes, setHours, setMinutes, isSameDay } from 'date-fns';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import 'react-day-picker/dist/style.css';

async function fetchRoom(roomId: string): Promise<Room> {
  const response = await fetch(`/api/rooms/${roomId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch room');
  }
  return response.json();
}

function generateTimeSlots() {
  const slots = [];
  let currentTime = setMinutes(setHours(new Date(), 9), 0);
  const endTime = setHours(new Date(), 17);

  while (currentTime <= endTime) {
    slots.push(new Date(currentTime));
    currentTime = addMinutes(currentTime, 30);
  }

  return slots;
}

export default function CreateBooking({ params }: { params: { roomId: string } }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const timeSlots = generateTimeSlots();

  const { data: room, isLoading, error } = useQuery<Room>(
    ['room', params.roomId],
    () => fetchRoom(params.roomId),
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  const bookingFormSchema = useMemo(() => z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    attendees: z.number()
      .min(1, 'Must have at least 1 attendee')
      .refine(
        (val) => {
          if (!room?.capacity) return false;
          return val <= room.capacity;
        },
        () => ({ message: `Number of attendees cannot exceed room capacity of ${room?.capacity || 0}` })
      ),
    purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  }), [room?.capacity]);

  type BookingFormData = z.infer<typeof bookingFormSchema>;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      title: '',
      attendees: 1,
      purpose: '',
    },
  });

  const handleTimeSelect = async (time: Date) => {
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(time.getHours());
    bookingDateTime.setMinutes(time.getMinutes());

    try {
      const response = await fetch(`/api/rooms/${params.roomId}/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: bookingDateTime.toISOString(),
        }),
      });

      const data = await response.json();

      if (!data.available) {
        toast({
          variant: "destructive",
          title: "Time slot not available",
          description: "This time slot has already been booked. Please select another time.",
        });
        return;
      }

      setSelectedTime(time);
      setShowForm(true);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check time slot availability. Please try again.",
      });
    }
  };

  const handleFormSubmit = async (data: BookingFormData) => {
    if (!selectedTime) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a time slot first.",
      });
      return;
    }

    try {
      const bookingDateTime = new Date(selectedDate);
      bookingDateTime.setHours(selectedTime.getHours());
      bookingDateTime.setMinutes(selectedTime.getMinutes());

      // Calculate end time (30 minutes after start time)
      const endDateTime = new Date(bookingDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + 30);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          startTime: bookingDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          roomId: params.roomId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create booking');
      }

      toast({
        title: "Success",
        description: "Booking created successfully.",
      });

      // Reset form and state
      form.reset();
      setSelectedTime(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create booking. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-32 rounded-lg" />
              <Separator orientation="vertical" className="h-8 mx-4" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="flex items-center gap-4">
              <Separator orientation="vertical" className="h-8 mx-4" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="container mx-auto py-4">
        <Card className="p-4">
          <div className="text-center text-red-500">
            Error loading room information. Please try again later.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 space-y-4 px-4">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-32 flex-shrink-0">
              <Image
                src={room?.imageUrl || "/rooms/placeholder-room.jpg"}
                alt={room?.name || 'Room'}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <Separator orientation="vertical" className="h-8 mx-4 hidden sm:block" />
            <h1 className="text-xl font-semibold">{room?.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Separator orientation="vertical" className="h-8 mx-4 hidden sm:block" />
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-5 w-5" />
              <span>Capacity: {room?.capacity} people</span>
            </div>
          </div>
        </div>
      </Card>

      {!showForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date || new Date());
                  setSelectedTime(null);
                  setShowForm(false);
                }}
                disabled={{ before: new Date() }}
                className="border-0"
              />
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Select Time Slot</h2>
            <ScrollArea className="h-[250px] sm:h-[300px] pr-4">
              <div className="space-y-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time.toISOString()}
                    variant={selectedTime && isSameDay(time, selectedTime) &&
                      time.getHours() === selectedTime.getHours() &&
                      time.getMinutes() === selectedTime.getMinutes()
                      ? "default"
                      : "outline"
                    }
                    className="w-full justify-start text-sm sm:text-base"
                    onClick={() => handleTimeSelect(time)}
                  >
                    {format(time, 'h:mm a')}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      ) : (
        <Card className="p-6">
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                {...form.register('title')}
                aria-invalid={!!form.formState.errors.title}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendees">Number of Attendees</Label>
              <Input
                id="attendees"
                type="number"
                min={1}
                max={room?.capacity || 1}
                {...form.register('attendees', { valueAsNumber: true })}
                aria-invalid={!!form.formState.errors.attendees}
              />
              {form.formState.errors.attendees && (
                <p className="text-sm text-red-500">{form.formState.errors.attendees.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Meeting Purpose</Label>
              <Textarea
                id="purpose"
                {...form.register('purpose')}
                aria-invalid={!!form.formState.errors.purpose}
              />
              {form.formState.errors.purpose && (
                <p className="text-sm text-red-500">{form.formState.errors.purpose.message}</p>
              )}
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setSelectedTime(null);
                  form.reset();
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Creating...' : 'Create Booking'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
