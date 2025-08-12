# Better Auth MongoDB Demo

A modern authentication template built with Next.js, Better Auth, and MongoDB. Features user registration, authentication, and a full-featured todo application demonstrating CRUD operations with MongoDB.

## Features

- 🔐 **Authentication**: Complete auth system with Better Auth
  - Email/password registration and login
  - GitHub OAuth support (configurable)
  - Session management
- 🍃 **MongoDB Integration**: Full MongoDB adapter for Better Auth
  - User and session storage
  - Todo CRUD operations
- 🎨 **Modern UI**: Built with shadcn/ui components
  - Responsive design
  - Dark/light theme support
  - Beautiful, accessible components
- ✅ **Todo Management**: Complete todo application
  - Create, read, update, delete todos
  - Toggle completion status
  - User-specific todos with authentication

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: Better Auth with MongoDB adapter
- **Database**: MongoDB
- **Styling**: TailwindCSS + shadcn/ui
- **TypeScript**: Full type safety
- **UI Components**: Radix UI + Lucide icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or Atlas)

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=better-auth

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Installation & Development

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/auth/          # Better Auth API routes
│   ├── api/todos/         # Todo CRUD API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard with todos
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── auth/              # Authentication components
│   └── ui/                # shadcn/ui components
└── lib/
    ├── auth.ts            # Better Auth configuration
    ├── auth-client.ts     # Client-side auth hooks
    └── types.ts           # TypeScript definitions
```

## Authentication Flow

1. **Landing Page**: Welcome screen with auth status
2. **Registration/Login**: Forms with validation and error handling
3. **Dashboard**: Protected route with user profile and todo management
4. **Session Management**: Automatic session handling with Better Auth

## API Routes

- `POST /api/auth/*` - Better Auth endpoints (handled automatically)
- `GET /api/todos` - Fetch user's todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/[id]` - Update todo
- `DELETE /api/todos/[id]` - Delete todo

## MongoDB Schema

The app uses Better Auth's automatic schema creation for users and sessions, plus custom collections for todos with proper user relationships.

## Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

- [Better Auth Documentation](https://better-auth.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
