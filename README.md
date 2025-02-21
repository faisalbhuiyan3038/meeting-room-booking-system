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
- Ability to choose day from calendar view and time slot for Booking
- Checks to ensure selected slot is free/unoccupied.

