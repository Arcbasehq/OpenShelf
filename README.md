# OpenShelf

> **Discover, search, and save your favorite books** — powered by [Astro](https://astro.build), [Convex](https://convex.dev), and the [Google Books API](https://developers.google.com/books).

![Astro](https://img.shields.io/badge/Astro-5-ff5d01?logo=astro&logoColor=white)
![Convex](https://img.shields.io/badge/Convex-1.x-6c47ff?logo=convex&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## Features

- **Search** — Find books from the Google Books catalog with instant search.
- **Browse** — View popular picks served from the Google Books API.
- **Book Detail** — View cover, description, authors, categories, and page count.
- **Favorites** — Save books to your personal list (stored in Convex).
- **Authentication** — Email + password and Google OAuth sign-in (via Convex Auth).
- **Responsive UI** — Mobile-friendly book cards, search bar, and dashboard.
- **Server-Side Rendering** — Astro SSR with `@astrojs/node` adapter.

---

## Project Structure

```
OpenShelf/
├── astro.config.mjs          # Astro config (SSR + Node adapter)
├── package.json
├── tsconfig.json
├── .env.example               # Environment variables template
│
├── convex/                    # Convex backend
│   ├── schema.ts              # Database schema (users, books, favorites)
│   ├── auth.config.ts         # Auth provider config
│   ├── users.ts               # User store/me queries
│   ├── books.ts               # Book upsert/get queries
│   └── favorites.ts           # Add/remove/list favorite books
│
├── public/                    # Static assets
│
└── src/
    ├── layouts/
    │   └── Layout.astro       # Shared layout (navbar, footer, global CSS)
    │
    ├── components/
    │   ├── BookCard.astro      # Reusable book card component
    │   ├── BookSearch.astro    # Search form + results grid
    │   └── FavoriteButton.astro # Save-to-favorites toggle (client-side)
    │
    └── pages/
        ├── index.astro        # Home page (hero + search + features)
        ├── search.astro       # Search results page
        ├── favorites.astro    # User's saved books
        ├── login.astro        # Login form
        ├── signup.astro       # Sign-up form
        │
        ├── books/
        │   ├── index.astro    # Browse books (popular picks)
        │   └── [id].astro     # Book detail page (dynamic route)
        │
        └── api/
            ├── search-books.ts       # GET — proxy Google Books API
            ├── favorites.ts          # GET — list user favorites
            ├── toggle-favorite.ts    # POST — add/remove favorite
            └── auth/
                ├── login.ts          # POST — email/password login
                └── signup.ts         # POST — email/password sign-up
```

---

## Prerequisites

| Tool    | Version |
| ------- | ------- |
| Node.js | >= 18   |
| npm     | >= 9    |

---

## Local Setup

### 1. Clone & install

```bash
git clone https://github.com/your-username/OpenShelf.git
cd OpenShelf
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

| Variable              | Required | Description                                     |
| --------------------- | -------- | ----------------------------------------------- |
| `GOOGLE_BOOKS_API_KEY`| No*      | Google API key (higher rate limits)              |
| `PUBLIC_CONVEX_URL`   | Yes      | Your Convex deployment URL                      |

\* The Google Books API works without a key but with lower rate limits.

### 3. Start Convex

In a separate terminal:

```bash
npx convex dev
```

This will:
- Create your Convex project (first time only)
- Deploy the schema and functions
- Print your deployment URL — paste it into `.env` as `PUBLIC_CONVEX_URL`

### 4. Start Astro dev server

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

---

## Environment Variables

Create a `.env` file at the project root (see `.env.example`):

```env
GOOGLE_BOOKS_API_KEY=AIza...
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

---

## Convex Database Schema

| Collection  | Fields                                                               |
| ----------- | -------------------------------------------------------------------- |
| `users`     | `name`, `email`, `provider`, `avatarUrl?`, `tokenIdentifier`        |
| `books`     | `googleId`, `title`, `authors[]`, `description?`, `thumbnail?`, etc |
| `favorites` | `userId` → users, `bookId` → books                                  |

---

## API Routes

| Method | Path                   | Description                        |
| ------ | ---------------------- | ---------------------------------- |
| GET    | `/api/search-books`    | Proxy Google Books search          |
| GET    | `/api/favorites`       | List current user's favorites      |
| POST   | `/api/toggle-favorite` | Add/remove a book from favorites   |
| POST   | `/api/auth/login`      | Email + password login             |
| POST   | `/api/auth/signup`     | Email + password sign-up           |

---

## Deployment

### Astro → Vercel

1. Install the Vercel adapter (swap `@astrojs/node` for `@astrojs/vercel`):

   ```bash
   npm install @astrojs/vercel
   ```

2. Update `astro.config.mjs`:

   ```js
   import vercel from "@astrojs/vercel";
   export default defineConfig({
     output: "server",
     adapter: vercel(),
   });
   ```

3. Push to GitHub and import in [Vercel Dashboard](https://vercel.com/new).
4. Add environment variables in Vercel → Project Settings → Environment Variables.

### Convex

Convex deploys automatically with `npx convex deploy` or through the Convex dashboard.

```bash
npx convex deploy
```

---

## Google Books API Quick Reference

```ts
// Search volumes
GET https://www.googleapis.com/books/v1/volumes?q=astro+programming&key=API_KEY

// Get a single volume
GET https://www.googleapis.com/books/v1/volumes/{volumeId}?key=API_KEY
```

Response shape (simplified):
```json
{
  "items": [
    {
      "id": "abc123",
      "volumeInfo": {
        "title": "...",
        "authors": ["..."],
        "description": "...",
        "imageLinks": { "thumbnail": "https://..." },
        "publishedDate": "2024",
        "pageCount": 320,
        "categories": ["Fiction"]
      }
    }
  ]
}
```

---

## License

MIT
