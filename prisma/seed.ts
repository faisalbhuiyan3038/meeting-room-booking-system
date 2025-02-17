// prisma/seed.ts
import { PrismaClient, UserRole, RoomStatus, BookingStatus } from '@prisma/client'
const prisma = new PrismaClient()

// IMPORTANT: Replace this with your actual Clerk user ID after signing up
const YOUR_CLERK_USER_ID = 'user_REPLACE_THIS_WITH_YOUR_CLERK_ID'

async function main() {
  console.log('Starting seed...')

  // Clean the database
  console.log('Cleaning database...')
  await prisma.booking.deleteMany()
  await prisma.userFavorite.deleteMany()
  await prisma.room.deleteMany()
  await prisma.user.deleteMany()

  // Create your user (using your real Clerk ID)
  console.log('Creating user...')
  const user = await prisma.user.create({
    data: {
      id: YOUR_CLERK_USER_ID,  // ⚠️ Replace with your Clerk user ID
      email: 'your.email@example.com', // Replace with your email
      firstName: 'Your',
      lastName: 'Name',
      role: UserRole.ADMIN, // Making you an admin so you can access everything
    },
  })

  // Create some rooms
  console.log('Creating rooms...')
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: 'Conference Room A',
        capacity: 20,
        amenities: ["PROJECTOR", "WHITEBOARD", "VIDEO_CONF"],
        status: RoomStatus.ACTIVE,
        description: 'Large conference room with full AV setup',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Meeting Room B',
        capacity: 8,
        amenities: ["WHITEBOARD", "TV_SCREEN"],
        status: RoomStatus.ACTIVE,
        description: 'Medium-sized meeting room for team discussions',
      },
    }),
  ])

  // Create some bookings for your user
  console.log('Creating bookings...')
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0) // 10 AM tomorrow

  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setHours(11, 0, 0, 0) // 11 AM tomorrow

  await prisma.booking.create({
    data: {
      roomId: rooms[0].id,
      userId: user.id, // This will be your user
      title: 'Team Meeting',
      description: 'Weekly team sync',
      startTime: tomorrow,
      endTime: tomorrowEnd,
      status: BookingStatus.CONFIRMED,
      attendees: 8,
      purpose: 'Team Sync',
    },
  })

  // Add a favorite room for your user
  console.log('Creating favorites...')
  await prisma.userFavorite.create({
    data: {
      userId: user.id,
      roomId: rooms[0].id,
    },
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
