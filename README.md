# TXTTOIMG (MERN)

Text-to-image MERN app:

- React frontend to enter a prompt and view generated images
- Express API to generate images (default provider: OpenAI)
- MongoDB to store generations (prompt + image metadata)

## Prereqs

- Node.js 18+ (recommended 20+)
- MongoDB (local or Atlas)

## Setup

1) Install deps:

```bash
npm install
```

2) Backend env:

Copy `server/.env.example` to `server/.env` and fill values.

3) Run dev:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and calls the API at `http://localhost:5174`.

## API

- `POST /api/generate` body: `{ "prompt": "..." }` → returns `{ image: { dataUrl, provider, model }, generation }`
- `GET /api/generations` → recent history

