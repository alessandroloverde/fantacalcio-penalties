# Fantacalcio Penalties

Nuxt 4 app to manage and calculate fantasy‑football penalty shootouts (“rigori”) using player scores, teams, and sessions.

## What’s inside
- `nuxt-app/` — main Nuxt app (Pinia stores, Firebase auth + Firestore)
- `Squadre/` — sample team and score CSV/XLSX data
- `design/` + `Icons/` — UI references and icon assets

## Features (from the UI)
- Calculate penalty shootouts between two teams
- Track takers, goalkeepers, and results
- Sessions / time windows and scores
- Login/profile/settings pages

## Tech Stack
- Nuxt 4 + Vue 3
- Pinia
- Firebase Auth + Firestore
- Tailwind + SCSS

## Quickstart
cd nuxt-app
pnpm install
pnpm devApp runs at `http://localhost:3000`.

## Firebase config
The app reads Firebase keys from Nuxt runtime config. You can override them with env vars:
