# InsyncX

E-commerce platform built with Next.js, Prisma, and NextAuth.

## Setup

1. Copy `.env.example` to `.env` and fill in your environment variables. (Only `.env.example` is committed — never commit `.env`.)
2. Install dependencies: `npm install`
3. Database: `npx prisma db push` (or `npx prisma migrate dev`)
4. Seed (optional): `npm run db:seed`
5. Run dev server: `npm run dev`

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run db:seed` — Seed database
