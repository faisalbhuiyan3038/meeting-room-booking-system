This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

- Follow `.env.example` and create your own env file.
- Run first migration `npx prisma migrate dev --name init`
- Generate prisma client with `npx prisma generate`
- Migrate seed data with `npx prisma db seed`

- User needs to be logged in to do anything. Complete app is blocked behind authentication.
