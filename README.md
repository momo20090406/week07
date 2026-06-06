# Anime Collection Website

## Overview
This project is a **single‑page anime collection web app** built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. It demonstrates a clean, modern UI using glass‑morphism style components, smooth micro‑animations, and a dark theme.

- **Data source**: `data/data.json` – a local JSON file storing anime items (title, image URL, description, etc.).
- **API**: `app/api/items/route.ts` provides **GET** and **POST** endpoints that read/write the JSON file via `fs/promises`.
- **Frontend**: `app/page.tsx` shows a form for adding new anime entries (using `useState` for local caching) and a list that is synced with the backend via `fetch()`.

## Features
- Add new anime items through a form.
- View the current collection in a responsive grid.
- Persist data in a JSON file – no database required.
- Fully typed with TypeScript for safety.
- Tailwind CSS for rapid styling and a premium glass‑morphism look.
- Dark‑mode ready and mobile‑responsive.

## Getting Started
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
Open http://localhost:3000 to see the app.

## Deployment
The app can be deployed to Vercel or any platform that supports Next.js. Ensure the `data/` folder is included in the build so the JSON file is available at runtime.

## License
MIT © 2026
