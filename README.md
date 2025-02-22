This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

- To understand my thought process, you can read my initial notes which I wrote before coding [notes](notes/notes.md)

## Getting Started

- Follow `.env.example` and create your own env file with proper variables.
- Run first migration `npx prisma migrate dev --name init`
- Generate prisma client with `npx prisma generate`
- Migrate seed data with `npx prisma db seed`
- The default user has admin role in seed data with email `admin@admin.com` and password `admin`.
- Run the development server with `npm run dev`
- Login and enjoy!


## Features Implemented
- Authentication/Sign-in/Sign-up with Clerk. Admin user is already created for the app in clerk.
- Beautiful Loading Component when app is fetching data.
- Beautiful and informative Meeting Room List Page showing capacity, amenities and status.
- Filter Meeting Room List by Capacity, Room Status and one or more amenities.
- Ability to favorite/unfavorite Meeting rooms by clicking on heart icon after hovering on image.
- Ability to see all Favorited Rooms in one page.
- Ability to see recently viewed rooms in one page.
- Ability to choose day from calendar view and time slot for Booking
- Checks to ensure selected slot is free/unoccupied.
- Perform CRUD operations on Rooms and Bookings.
- Upload image for new rooms to Cloudinary.
- Ability to edit/cancel current user's booking.
- Prevent double booking by immediately checking if selected slot is free/unoccupied.

## Technical Jargons
- Used Next.js 14 with App Router instead of the latest Next.js 15.
- Used AivenDB free tier for database with Prisma as ORM.
- Used Clerk for managing users.
- Used React Query for data fetching and caching.
- Used Cloudinary for image storage.
- Saved recently viewed rooms in local storage.
- Save favourite rooms in Database.
- Used TailwindCSS for styling.
- Used Zod for form validation.
- Used Shadcn UI for components.
- Used lucide icons for icons.

## Features left to implement
- Update seed data with more rooms for pagination and create admin user to clerk with it.
- Fix up Getting Started section.

