// prisma/seed.ts
import { PrismaClient, UserRole, RoomStatus, BookingStatus } from '@prisma/client'
const prisma = new PrismaClient()

// ⚠️ IMPORTANT: First sign up through the app, then replace this with your Clerk user ID
const YOUR_CLERK_USER_ID = 'user_REPLACE_THIS_WITH_YOUR_CLERK_ID'

async function main() {
  if (YOUR_CLERK_USER_ID === 'user_REPLACE_THIS_WITH_YOUR_CLERK_ID') {
    throw new Error('Please replace YOUR_CLERK_USER_ID with your actual Clerk user ID first!')
  }

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
      id: YOUR_CLERK_USER_ID,
      email: 'your.email@example.com', // Replace with your email
      firstName: 'Your',
      lastName: 'Name',
      role: UserRole.ADMIN,
    },
  })

  // Create five rooms
  console.log('Creating rooms...')
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: 'Executive Boardroom',
        capacity: 30,
        amenities: ["PROJECTOR", "WHITEBOARD", "VIDEO_CONF", "TV_SCREEN", "COFFEE_MACHINE"],
        status: RoomStatus.ACTIVE,
        description: 'Premium boardroom with state-of-the-art facilities',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Team Collaboration Space',
        capacity: 15,
        amenities: ["WHITEBOARD", "TV_SCREEN", "VIDEO_CONF"],
        status: RoomStatus.ACTIVE,
        description: 'Open space perfect for team brainstorming sessions',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Focus Room',
        capacity: 4,
        amenities: ["WHITEBOARD", "TV_SCREEN"],
        status: RoomStatus.ACTIVE,
        description: 'Small room ideal for focused discussions',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Training Room',
        capacity: 25,
        amenities: ["PROJECTOR", "WHITEBOARD", "VIDEO_CONF", "TV_SCREEN"],
        status: RoomStatus.ACTIVE,
        description: 'Spacious room equipped for training sessions and workshops',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Creative Studio',
        capacity: 10,
        amenities: ["WHITEBOARD", "TV_SCREEN", "VIDEO_CONF"],
        status: RoomStatus.ACTIVE,
        description: 'Modern space designed for creative meetings and design thinking',
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
