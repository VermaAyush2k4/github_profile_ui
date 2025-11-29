# GitHub Profile UI

This is a small React app that shows a GitHub profile and a contributions heatmap.

Features:
- Responsive two-column layout (left profile / right content)
- Profile information fetched from https://api.github.com/users/:username (live)
-- Contributions heatmap (mocked data — the project does not use a client-side token)
- Repositories tab fetches real public repositories from the REST API (falls back to mock data if the API fails)

Getting started

1. Install dependencies

```powershell
npm install
```

2. Create a `.env.local` (or use `.env`) at the project root and add:

```env
REACT_APP_GITHUB_USERNAME=shreeramk
```

3. Run the app

```powershell
npm start
```

- The heatmap uses mocked data in this project (no client-side tokens are used).
- Profile data is fetched from the public REST API: `https://api.github.com/users/:username` which is unauthenticated and public.

Reference:
- Profile REST API: https://docs.github.com/en/rest/reference/users#get-a-user
- GitHub GraphQL: https://docs.github.com/en/graphql

Run in Docker (production build served by nginx)

1. Optionally create a `.env` or set environment variables in your shell with:

```
REACT_APP_GITHUB_USERNAME=shreeramk
```

2. Build and run with docker-compose (from project root):

```powershell
docker compose up --build
```

3. Visit the app in your browser:

Local: http://localhost:3000
And this Application Deployed in "http://100.28.218.144/"

Notes:
- The Docker setup performs a production build and serves it with nginx on port 3000, which is exposed and forwarded to your host so you can open the app from your machine or other devices on the same network.
-- This project uses mocked contributions for the heatmap and does not rely on a client-side GitHub token.
