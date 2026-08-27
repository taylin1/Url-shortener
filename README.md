# Link Shortener

A URL shortener built with React (Vite) on the client and Express on the server, using Supabase for authentication and data storage.

## Project Structure

```
link-shortener/
├── client/                  # React frontend
│   ├── src/
│   │   ├── lib/            # Supabase client
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.local          # Environment variables
│   └── package.json
│
├── server/                  # Express API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/      # Auth middleware
│   │   ├── lib/            # Supabase client (service role)
│   │   └── index.js
│   ├── tests/              # Tests
│   ├── .env                # Environment variables
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project

### Installation

1. Install dependencies:
```bash
npm install
cd client && npm install
cd ../server && npm install
```

2. Set up environment variables:
```bash
# Client
cp client/.env.example client/.env.local
# Edit client/.env.local with your Supabase credentials

# Server
cp server/.env.example server/.env
# Edit server/.env with your Supabase credentials
```

3. Start development servers:
```bash
npm run dev
```

## API Routes

- `POST /api/shorten` - Create a short link
- `GET /api/links` - Get user's links
- `GET /:code` - Redirect to original URL

## Tech Stack

- **Client**: React, Vite, Tailwind CSS
- **Server**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth

## Database
- `links` — stores shortened URLs per user
- `clicks` — stores click events for analytics
