# WhutMovie

A curated movie recommendation platform built with Next.js 15, Tailwind CSS v4, shadcn/ui, and Prisma/PostgreSQL.

## Features

- Dark-first design with Bordeaux accent color
- Server-side rendering for optimal performance
- Accessible UI with keyboard navigation and proper focus management
- Movie browsing with genre and category filters
- Paginated movie listings
- Admin panel with authentication
- REST API for movie, category, and genre management

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript/JSX
- **Styling**: Tailwind CSS v4 with OKLCH color tokens
- **UI Components**: shadcn/ui (configured for JSX)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based with bcrypt password hashing
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted like Supabase, Neon, etc.)
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables. Create a `.env` file:

```env
# Database connection (required)
DATABASE_URL="postgresql://user:password@localhost:5432/whutmovie?schema=public"

# For Prisma migrations (use same as DATABASE_URL for local, or direct connection for hosted DBs)
DIRECT_URL="postgresql://user:password@localhost:5432/whutmovie?schema=public"

# Admin password for seeding (optional, defaults to "whutmovie2024")
ADMIN_PASSWORD="your-secure-password"
```

3. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

4. Seed the database with initial data:

```bash
npx prisma db seed
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Admin Panel

The admin panel allows you to manage all content without touching the database directly.

### Access

| Page | URL |
|------|-----|
| Login | `/admin/login` |
| Dashboard | `/admin` |
| Categories | `/admin/categories` |
| Movies | `/admin/movies` |
| Genres | `/admin/genres` |
| Admin Users | `/admin/users` |

### Default Credentials

- **Username**: `admin`
- **Password**: `whutmovie2024` (or whatever you set in `ADMIN_PASSWORD` env variable)

### Features

- **Movies**: Create, edit, delete movies with genres and WhutSummary descriptions
- **Categories**: Create, edit categories with Top 3 picks and honorable mentions
- **Genres**: Manage movie genres
- **Admin Users**: Create additional admin accounts, change passwords
- **Password Hasher**: Generate bcrypt hashes for manual database operations

---

## Generating Password Hashes

If you need to create admin users directly in the database or reset passwords manually, you'll need to generate bcrypt hashes.

### Option 1: Via Admin Panel

1. Log in to `/admin/users`
2. Scroll to "Password Hash Generator"
3. Enter your desired password
4. Click "Generate Hash"
5. Copy the resulting hash

### Option 2: Via Terminal

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD_HERE', 12).then(h => console.log(h))"
```

### Option 3: Using Prisma Studio

1. Generate a hash using one of the methods above
2. Run `npx prisma studio`
3. Navigate to `AdminUser` table
4. Create or edit a user, pasting the hash into `passwordHash` field

---

## Deployment to Vercel

### Prerequisites

1. A [Vercel account](https://vercel.com)
2. A hosted PostgreSQL database (recommended: [Supabase](https://supabase.com), [Neon](https://neon.tech), or [PlanetScale](https://planetscale.com))

### Step-by-Step Deployment

#### 1. Set up your database

If using **Supabase**:
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string
3. Copy the URI (use "Transaction pooler" for `DATABASE_URL`, "Session pooler" or direct for `DIRECT_URL`)

If using **Neon**:
1. Create a project at [neon.tech](https://neon.tech)
2. Copy your connection string from the dashboard

#### 2. Push your code to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 3. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your pooled database connection string |
| `DIRECT_URL` | Your direct database connection string |
| `ADMIN_PASSWORD` | Your secure admin password |

4. Click **Deploy**

#### 4. Run database migrations

After deployment, run migrations via Vercel CLI or locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Pull env variables
vercel env pull .env.local

# Run migrations against production
npx prisma migrate deploy

# Seed the database (optional, for initial data)
npx prisma db seed
```

Or use the Vercel dashboard to run a one-time function/script.

### Environment Variables for Vercel

```env
DATABASE_URL="postgresql://user:password@host:5432/db?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/db"
ADMIN_PASSWORD="your-secure-admin-password"
```

**Note**: For Supabase/Neon, use the pooled connection for `DATABASE_URL` and direct connection for `DIRECT_URL` (required for migrations).

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma migrate dev` | Run database migrations (development) |
| `npx prisma migrate deploy` | Run migrations (production) |
| `npx prisma studio` | Open Prisma Studio GUI |
| `npx prisma db seed` | Seed the database |
| `npx prisma db push` | Push schema changes without migration |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── movies/         # Movies REST API
│   │   ├── categories/     # Categories REST API
│   │   ├── genres/         # Genres REST API
│   │   └── admin/          # Admin API (login, users, etc.)
│   ├── admin/              # Admin panel pages
│   │   ├── login/          # Admin login
│   │   ├── categories/     # Category management
│   │   ├── movies/         # Movie management
│   │   ├── genres/         # Genre management
│   │   └── users/          # Admin user management
│   ├── categories/         # Public categories pages
│   ├── movies/             # Public movies pages
│   │   └── [slug]/         # Dynamic movie detail page
│   ├── about/              # About page
│   ├── contact/            # Contact page
│   ├── globals.css         # Tailwind + theme tokens
│   ├── layout.jsx          # Root layout
│   └── page.jsx            # Home page
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── site-header.jsx     # Navigation header
└── lib/
    ├── prisma.js           # Prisma client singleton
    ├── auth.js             # Authentication utilities
    ├── slugify.js          # URL slug helper
    └── utils.js            # Utility functions

prisma/
├── schema.prisma           # Database schema
└── seed.js                 # Database seed script
```

---

## API Reference

### Movies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | List movies (with pagination, filters) |
| POST | `/api/movies` | Create a movie |
| GET | `/api/movies/[id]` | Get a single movie |
| PATCH | `/api/movies/[id]` | Update a movie |
| DELETE | `/api/movies/[id]` | Delete a movie |

**Query parameters for GET /api/movies:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 12, max: 100)
- `genre` - Filter by genre slug
- `category` - Filter by category slug
- `sort` - Sort by "year" (default) or "title"

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create a category |
| GET | `/api/categories/[id]` | Get a single category |
| PATCH | `/api/categories/[id]` | Update a category |
| DELETE | `/api/categories/[id]` | Delete a category |

### Genres

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/genres` | List genres |
| POST | `/api/genres` | Create a genre |
| GET | `/api/genres/[id]` | Get a single genre |
| PATCH | `/api/genres/[id]` | Update a genre |
| DELETE | `/api/genres/[id]` | Delete a genre |

---

## Database Schema

- **Movie**: Core entity with title, slug, whutSummary, description, year
- **Genre**: Movie genres (many-to-many with Movie)
- **Category**: Curated categories with descriptions
- **CategoryAssignment**: Join table linking movies to categories with rank (1-3) or honorable mention flag
- **AdminUser**: Admin accounts with hashed passwords
- **Session**: User sessions for authentication

---

## Troubleshooting

### "Cannot find module '@prisma/client'"

Run:
```bash
npx prisma generate
```

### Database connection errors

1. Check your `DATABASE_URL` is correct
2. Ensure your database is running
3. For hosted databases, check if your IP is whitelisted

### Migrations failing on Vercel

Use `DIRECT_URL` for migrations (non-pooled connection):
```env
DIRECT_URL="postgresql://user:password@host:5432/db"
```

### Reset database (development only)

```bash
npx prisma migrate reset
```

This will drop all tables, re-run migrations, and re-seed.

### Production database migrations

**IMPORTANT**: For production databases with real data, always use:

```bash
npx prisma migrate deploy
```

NEVER use `npx prisma migrate reset` or `npx prisma db push --force-reset` on production as it will DELETE ALL DATA. The `migrate deploy` command safely applies pending migrations without data loss.

---

## Design System

The app uses a dark-first design with these key colors:

- **Background**: #232c33 (dark blue-gray)
- **Surfaces/Cards**: #1c1c1c (near black)
- **Primary Accent**: #6D071A (Bordeaux)
- **Text**: #ffffff (white)

Colors are defined using OKLCH color space for better perceptual uniformity.

---

## License

MIT
