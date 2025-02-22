
import { PrismaClient, UserRole, RoomStatus, BookingStatus } from '@prisma/client'
import { clerkClient } from '@clerk/nextjs/server'


const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clean db to ensure no duplicate records
  console.log('Cleaning database...')
  await prisma.booking.deleteMany()
  await prisma.userFavorite.deleteMany()
  await prisma.room.deleteMany()
  await prisma.user.deleteMany()

  // Create users in Clerk
  console.log('Creating users in Clerk...')
  const clerk = await clerkClient()
  const adminClerk = await clerk.users.createUser({
    emailAddress: ['admin@admin.com'],
    password: 'Password123',
    firstName: 'Admin',
    lastName: 'User'
  })

  const regularClerk = await clerk.users.createUser({
    emailAddress: ['user@user.com'],
    password: 'Password123',
    firstName: 'Regular',
    lastName: 'User'
  })

  // Create same users in Prisma and assign roles
  console.log('Creating users in Prisma...')
  const adminUser = await prisma.user.create({
    data: {
      id: adminClerk.id,
      email: 'admin@admin.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  })

  const regularUser = await prisma.user.create({
    data: {
      id: regularClerk.id,
      email: 'user@user.com',
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
    },
  })

  // Create ten rooms with random data
  console.log('Creating rooms...')
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: 'Executive Boardroom',
        capacity: 30,
        imageUrl: "https://res.cloudinary.com/djpd7tq4a/image/upload/v1739892436/Executive_Boardroom_mnuygp.jpg",
        amenities: [
          "videoConference",
          "projector",
          "whiteboard",
          "tv",
          "airConditioning",
          "conferenceTable"
        ],
        status: RoomStatus.ACTIVE,
        description: 'Premium boardroom with state-of-the-art facilities',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Team Collaboration Space',
        capacity: 15,
        imageUrl: "https://res.cloudinary.com/djpd7tq4a/image/upload/v1739892709/Team_Collaboration_Space_grmwww.jpg",
        amenities: [
          "whiteboard",
          "tv",
          "videoConference",
          "wifi",
          "flipChart",
          "powerOutlets"
        ],
        status: RoomStatus.MAINTENANCE,
        description: 'Open space perfect for team brainstorming sessions',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Focus Room',
        capacity: 4,
        imageUrl: "https://res.cloudinary.com/djpd7tq4a/image/upload/v1739892774/Focus_Room_thxb19.jpg",
        amenities: [
          "whiteboard",
          "tv",
          "wifi",
          "powerOutlets",
          "airConditioning",
          "conferenceTable"
        ],
        status: RoomStatus.ACTIVE,
        description: 'Small room ideal for focused discussions',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Training Room',
        capacity: 25,
        imageUrl: "https://res.cloudinary.com/djpd7tq4a/image/upload/v1739892982/Training_Room_xjmgci.jpg",
        amenities: [
          "projector",
          "whiteboard",
          "videoConference",
          "tv",
          "wifi",
          "powerOutlets"
        ],
        status: RoomStatus.INACTIVE,
        description: 'Spacious room equipped for training sessions and workshops',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Creative Studio',
        capacity: 10,
        imageUrl: "https://res.cloudinary.com/djpd7tq4a/image/upload/v1739893056/Creative_Studio_gvxnje.jpg",
        amenities: [
          "whiteboard",
          "tv",
          "videoConference",
          "wifi",
          "naturalLight",
          "flipChart",
          "powerOutlets"
        ],
        status: RoomStatus.ACTIVE,
        description: 'Modern space designed for creative meetings and design thinking',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Innovation Lab',
        capacity: 20,
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c",
        amenities: [
          "whiteboard",
          "projector",
          "videoConference",
          "wifi",
          "powerOutlets",
          "conferenceTable",
          "airConditioning"
        ],
        status: RoomStatus.MAINTENANCE,
        description: 'High-tech space for innovation and prototyping sessions',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Quiet Zone',
        capacity: 6,
        imageUrl: "https://images.unsplash.com/photo-1497366412874-3415097a27e7",
        amenities: [
          "wifi",
          "powerOutlets",
          "naturalLight",
          "conferenceTable",
          "airConditioning",
          "chairs"
        ],
        status: RoomStatus.ACTIVE,
        description: 'Peaceful space for concentrated work and small meetings',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Digital Hub',
        capacity: 12,
        imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
        amenities: [
          "videoConference",
          "tv",
          "wifi",
          "powerOutlets",
          "whiteboard",
          "conferenceTable"
        ],
        status: RoomStatus.INACTIVE,
        description: 'Tech-enabled room for digital collaboration',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Strategy Room',
        capacity: 8,
        imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
        amenities: [
          "whiteboard",
          "tv",
          "wifi",
          "powerOutlets",
          "conferenceTable",
          "naturalLight"
        ],
        status: RoomStatus.ACTIVE,
        description: 'Intimate setting for strategic planning sessions',
      },
    }),
    prisma.room.create({
      data: {
        name: 'Presentation Hall',
        capacity: 40,
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c",
        amenities: [
          "projector",
          "videoConference",
          "wifi",
          "powerOutlets",
          "airConditioning",
          "chairs",
          "soundSystem"
        ],
        status: RoomStatus.ACTIVE,
        description: 'Large space for presentations and company-wide meetings',
      },
    }),
  ])

  // Create a booking
  console.log('Creating bookings...')
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 30, 0, 0) // 9:30 AM tomorrow

  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setHours(10, 0, 0, 0) // 10:00 AM tomorrow

  await prisma.booking.create({
    data: {
      roomId: rooms[0].id,
      userId: adminUser.id,
      title: 'Strategy Meeting',
      description: 'Quarterly planning session',
      startTime: tomorrow,
      endTime: tomorrowEnd,
      status: BookingStatus.CONFIRMED,
      attendees: 8,
      purpose: 'Planning',
    },
  })

  // Add a favourite room
  console.log('Creating favorites...')
  await prisma.userFavorite.create({
    data: {
      userId: adminUser.id,
      roomId: rooms[0].id,
    },
  })

  await prisma.userFavorite.create({
    data: {
      userId: regularUser.id,
      roomId: rooms[2].id,
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
