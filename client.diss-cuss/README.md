# Movie Discussion Website
A modern, full-stack web platform for discussing movies and TV shows in real time. Users can create and join discussion threads, reply with threaded comments, like posts, and interact live with others. The platform features secure authentication, user profiles, search and filtering, and is optimized for SEO. Built with Next.js, Node.js, PostgreSQL, Prisma, NextAuth.js, and Socket.io, and integrates with the TMDB API for up-to-date movie and TV data.

---

## Features

- **User Authentication:** Sign up, sign in, email verification, and secure session management via NextAuth.js.
- **Movie & TV Collections:** Browse trending and popular movies/TV shows using TMDB API integration.
- **Discussion Threads:** Create, view, reply, and like threads dedicated to specific movies or shows.
- **Real-time Interactions:** Live updates for discussions and replies powered by Socket.io.
- **Search & Filter:** Quickly find movies, threads, or posts with advanced search and filtering.
- **User Profiles & Permissions:** Manage your profile, view your posts, and control privacy settings.
- **SEO-friendly:** Dynamic metadata and sitemap generation for improved search engine visibility.
- **Privacy & Terms:** Dedicated privacy policy and terms of service pages.
- **Responsive Design:** Fully responsive UI for desktop and mobile devices.

---

## Project Structure

```
client.diss-cuss/
├── action/                # Business logic and action handlers
├── app/                   # Next.js app directory
│   ├── (root)/            # Root-level components
│   │   └── _components/   # Shared UI components
│   ├── api/               # API routes
│   │   ├── auth/          # Auth endpoints (sign-up, sign-in, verify, etc.)
│   │   ├── collection/    # Movie/TV collection APIs
│   │   ├── post/          # Post and reply endpoints
│   │   ├── search/        # Search endpoints
│   │   └── threads/       # Thread endpoints (like, reply, etc.)
│   ├── auth/              # Auth UI pages
│   ├── discuss/           # Discussion pages and components
│   ├── privacy-policy/    # Privacy policy page
│   ├── sitemap.xml        # SEO sitemap
│   └── terms/             # Terms and conditions page
├── components/            # Reusable UI components
│   ├── global/            # Global UI (navbar, footer, etc.)
│   └── theme/             # Theme and style components
├── contexts/              # React context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries and helpers
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions/helpers
```

---

## Technology Stack

- **Frontend:** Next.js (React), Server Components, API Routes
- **Backend:** Node.js (API routes within Next.js)
- **Database:** PostgreSQL (managed via Prisma ORM)
- **Authentication:** NextAuth.js
- **Real-time:** Socket.io
- **External APIs:** TMDB (The Movie Database)
- **Deployment:** Vercel (recommended) or any Node.js hosting

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- TMDB API key ([get one here](https://www.themoviedb.org/))

### Installation

1. **Clone the repository**
  ```bash
  git clone https://github.com/yourusername/movie-discussion-website.git
  cd movie-discussion-website
  ```

2. **Install dependencies**
  ```bash
  npm install
  ```

3. **Set up environment variables**

  Create a `.env` file in the root directory with the following:

  ```
  NEXTBASE_URL="http://localhost:3000"

# supabase database connections
DATABASE_URL="<YOUR_DATABASE_URL>"
DIRECT_URL="<YOUR_DIRECT_URL>"
NEXTAUTH_SECRET="<YOUR_NEXTAUTH_SECRET>"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="<YOUR_GOOGLE_CLIENT_ID>"
GOOGLE_CLIENT_SECRET="<YOUR_GOOGLE_CLIENT_SECRET>"
TMDB_BASE_URL="https://api.themoviedb.org/3"
TMDB_API_KEY="<YOUR_TMDB_API_KEY>"
TMDB_ACCESS_TOKEN="<YOUR_TMDB_ACCESS_TOKEN>"
MAILER_EMAIL="<YOUR_EMAIL_ADDRESS>"
MAILER_PASSWORD="<YOUR_EMAIL_PASSWORD>"
JWT_SECRET="<YOUR_JWT_SECRET>"
  ```

4. **Run database migrations**
  ```bash
  npx prisma migrate deploy
  ```

5. **Start the development server**
  ```bash
  npm run dev
  ```

6. **Open your browser**

  Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## Available Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build the app for production
- `npm run start` — Start the production server
- `npx prisma migrate deploy` — Apply database migrations
- `npx prisma studio` — Open Prisma database GUI

---

## Support

For questions or support, contact:  
**Email:** mk3529895@gmail.com

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
