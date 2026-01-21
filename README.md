# WhutMovie

A curated movie recommendation platform built with Next.js 15, Tailwind CSS v4, shadcn/ui, and Prisma/PostgreSQL.

## Features

- Dark-first design with Bordeaux accent color
- Server-side rendering for optimal performance
- Accessible UI with keyboard navigation and proper focus management
- Movie browsing with genre and category filters
- Paginated movie listings
- REST API for movie management

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript/JSX
- **Styling**: Tailwind CSS v4 with OKLCH color tokens
- **UI Components**: shadcn/ui (configured for JSX)
- **Database**: PostgreSQL with Prisma ORM
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables. Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/whutmovie?schema=public"
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

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run prisma:seed` | Seed the database |

## Project Structure

```
src/
├── app/
│   ├── api/movies/      # REST API routes
│   ├── about/           # About page
│   ├── contact/         # Contact page with form
│   ├── movies/          # Movies listing and detail pages
│   │   └── [slug]/      # Dynamic movie detail page
│   ├── globals.css      # Tailwind + theme tokens
│   ├── layout.jsx       # Root layout
│   └── page.jsx         # Home page
├── components/
│   ├── ui/              # shadcn/ui components
│   └── site-header.jsx  # Navigation header
└── lib/
    ├── prisma.js        # Prisma client singleton
    ├── slugify.js       # URL slug helper
    └── utils.js         # Utility functions

prisma/
├── schema.prisma        # Database schema
└── seed.js              # Database seed script
```

## Database Schema

- **Movie**: Core entity with title, slug, description, year
- **Genre**: Movie genres (many-to-many with Movie)
- **Category**: Classification categories (Top Picks, Honorable Mentions)
- **CategoryAssignment**: Join table with rank support for "Top 3" style rankings

## API Endpoints

### GET /api/movies

List movies with optional filtering and pagination.

Query parameters:
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 12, max: 100)
- `genre` - Filter by genre slug
- `category` - Filter by category slug
- `sort` - Sort by "year" (default) or "title"

### POST /api/movies

Create a new movie.

Request body:
```json
{
  "title": "Movie Title",
  "slug": "movie-title",
  "description": "Movie description",
  "year": 2024,
  "genreSlugs": ["action", "drama"],
  "picks": [
    { "categorySlug": "top", "rank": 1 },
    { "categorySlug": "honorable", "honorable": true }
  ]
}
```

## Design System

The app uses a dark-first design with these key colors:

- **Background**: #232c33 (dark blue-gray)
- **Surfaces/Cards**: #1c1c1c (near black)
- **Primary Accent**: #6D071A (Bordeaux)
- **Text**: #ffffff (white)

Colors are defined using OKLCH color space for better perceptual uniformity.

## License

MIT
