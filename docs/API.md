# API contract

The frontend calls a Cloudflare Worker at `VITE_API_URL`. Implement these routes in your Worker (Supabase-backed).

All protected routes require:

```
Authorization: Bearer <supabase_access_token>
```

## Auth

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/auth/signup` | `{ email, password, name? }` | `{ token, user: { id, email, name } }` |
| POST | `/auth/signin` | `{ email, password }` | `{ token, user: { id, email, name } }` |
| POST | `/auth/signout` | — | `{ ok: true }` |
| GET | `/auth/me` | — | `{ user: { id, email, name } }` |

## Data

| Method | Path | Response |
|--------|------|----------|
| GET | `/dashboard` | `{ latestWeight, workoutsThisWeek, avgSleepHours, caloriesToday, weightTrend[], rings[], stepsToday, distanceTodayKm }` |
| GET | `/body` | `{ entries[] }` |
| POST | `/body` | `{ weight_kg?, body_fat_pct?, waist_cm?, notes? }` → `{ id }` |
| GET | `/workouts` | `{ entries[] }` |
| POST | `/workouts` | `{ name, duration_min?, volume_kg?, notes? }` → `{ id }` |
| GET | `/routes` | `{ entries[] }` |
| POST | `/routes` | `{ name?, distance_km, activity_type?, path?, steps?, avg_pace_min_km?, started_at?, ended_at?, elevation_m?, duration_min? }` → `{ id }` |
| GET | `/nutrition` | `{ entries[], totals: { calories, protein_g, carbs_g, fat_g, water_ml } }` |
| POST | `/nutrition` | `{ meal, calories?, protein_g?, carbs_g?, fat_g?, water_ml? }` → `{ id }` |
| GET | `/sleep` | `{ entries[], trend[] }` |
| POST | `/sleep` | `{ duration_h, quality?, notes?, source?, started_at?, ended_at? }` → `{ id }` |
| GET | `/profile` | `{ id, email, name, created_at, stats: { … } }` |
| PATCH | `/profile` | `{ name? }` → `{ user }` |

## Types

See `src/types/field-log.ts` for the TypeScript shapes the frontend expects.

## CORS

Your Worker must allow the frontend origin (set via `ALLOWED_ORIGIN` in Cloudflare secrets).

## Health check

| Method | Path | Response |
|--------|------|----------|
| GET | `/health` | `{ ok: true }` |
