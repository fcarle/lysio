# Lysio - Provider & Client Platform

A modern web application built with Next.js and Supabase for connecting providers and clients.

## Features

- User authentication (signup/login)
- Role-based access (Provider/Client)
- Modern UI with Tailwind CSS
- Real-time updates with Supabase

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd lysio
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup

1. Create a new project in Supabase
2. Enable Email authentication in Authentication > Providers
3. Create a new table called `profiles` with the following columns:
   - id (uuid, primary key)
   - user_id (uuid, foreign key to auth.users)
   - role (text, enum: 'provider' or 'client')
   - created_at (timestamp with time zone, default: now())

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint 