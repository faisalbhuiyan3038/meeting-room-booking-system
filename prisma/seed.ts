// prisma/seed.ts
import { PrismaClient, UserRole, RoomStatus, BookingStatus } from '@prisma/client'
const prisma = new PrismaClient()

// ⚠️ IMPORTANT: First sign up through the app, then replace this with your Clerk user ID
const YOUR_CLERK_USER_ID: string = 'user_2tCUCKsyQnHgaGMGO7er3sipNG6';

async function main() {
  if (YOUR_CLERK_USER_ID === 'user_REPLACE_THIS_WITH_YOUR_CLERK_ID') {
    throw new Error('Please replace YOUR_CLERK_USER_ID with your actual Clerk user ID first!')
  }

  console.log('Starting seed...')

  // Clean the database (preserving users)
  console.log('Cleaning database...')
  await prisma.booking.deleteMany()
  await prisma.userFavorite.deleteMany()
  await prisma.room.deleteMany()
  // await prisma.user.deleteMany() // Commented out to preserve existing users

  // Update your user to admin role
  console.log('Updating user role to admin...')
  const user = await prisma.user.update({
    where: { id: YOUR_CLERK_USER_ID },
    data: { role: UserRole.ADMIN },
  })

  // Create five rooms
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
          "conferenceTable",
          "powerOutlets",
          "deskPhoneSystem",
          "naturalLight",
          "windowCoverings",
          "chairs"
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
          "powerOutlets",
          "naturalLight",
          "chairs",
          "conferenceTable",
          "heating"
        ],
        status: RoomStatus.ACTIVE,
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
          "conferenceTable",
          "chairs",
          "heating"
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
          "powerOutlets",
          "airConditioning",
          "flipChart",
          "waterDispenser",
          "handicapAccessible",
          "chairs",
          "conferenceTable"
        ],
        status: RoomStatus.ACTIVE,
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
          "powerOutlets",
          "chairs",
          "conferenceTable",
          "heating",
          "windowCoverings"
        ],
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
