# Caddy (web)

A rebuild of the SwiftUI app as a React + Supabase + Netlify web app. Same
functionality — log shots by voice or text, get a distance-adjusted club
recommendation, browse your bag — with a design identity instead of default
Tailwind-card styling.

## Design direction

**Palette** — deep pine greens (`#0f3d2e`, `#0b2a1f`) with a single gold
accent (`#f0c419`) on a warm cream page background. Two signal colors
(rust-red / green) are used *only* for wind direction and adjustment
polarity — nowhere else — so they carry meaning instead of decorating.

**Type** — Fraunces (a high-contrast serif with real personality, used for
club names and headlines — it reads like an engraved trophy plate, not a
generic display serif) + Inter for body copy + IBM Plex Mono for every
number (distances, percentages, adjustments), so stats always look like
they're sitting on a scoreboard.

**Signature element** — your bag isn't a settings list, it's a
**leaderboard**: clubs ranked by carry distance on a dark green board with
gold serif numerals, exactly like a tournament standings board. That's the
one place the design takes a real swing; everything around it (forms,
buttons, toasts) stays quiet and disciplined so the leaderboard reads as
the centerpiece.

## Architecture

```
src/
  lib/            Ported model + business logic (framework-free, same math
                   as the Swift version: club normalization, wind/slope/lie
                   adjustments, club scoring, stats aggregation)
  components/      UI
  App.jsx          Wiring
netlify/functions/  Server-side OpenRouter calls — the API key never
                     reaches the browser
supabase/schema.sql  Tables + RLS policies
```

### Why a Netlify function instead of calling OpenRouter from the browser

The original iOS app had the OpenRouter key baked into client code, which
is fine on-device but is an instant leak on the web — anyone can open dev
tools and read it out of the bundle. `parse-shot` and `parse-situation` are
Netlify functions that hold `OPENROUTER_API_KEY` server-side; the browser
only ever talks to your own domain.

### Why Supabase anonymous auth

Shots need to be scoped per-user so two people on the same site don't see
each other's bag, but this doesn't need a login screen. `ensureSession()`
calls `supabase.auth.signInAnonymously()` on first load, which gives each
browser/device a stable `user_id` that Postgres RLS policies scope all
reads/writes to. If you want real accounts later (so a bag follows someone
across devices), swap this for `supabase.auth.signInWithOtp()` or similar —
the RLS policies don't need to change.

## Setup

### 1. Supabase

1. Create a project at supabase.com.
2. In **Authentication → Providers**, enable **Anonymous Sign-Ins**.
3. In the SQL editor, run `supabase/schema.sql`.
4. Grab your Project URL and anon public key from **Settings → API**.

### 2. Environment variables

Copy `.env.example` to `.env.local` for local dev:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
OPENROUTER_API_KEY=sk-or-...
```

In Netlify: **Site configuration → Environment variables**, add all three.
(`VITE_*` ones get baked into the client build; `OPENROUTER_API_KEY` stays
server-side and is only read by the functions in `netlify/functions/`.)

**Rotate your OpenRouter key before using it here** — the one in the
original `LLMService.swift` was committed in plaintext and should be
treated as burned.

### 3. Local dev

```
npm install
npm install -g netlify-cli   # if you don't have it
netlify dev
```

`netlify dev` runs Vite *and* serves the functions locally at
`/.netlify/functions/*`, which is what `vite.config.js`'s proxy expects.
(Plain `npm run dev` also works but the LLM parsing calls will 404 without
`netlify dev` running the functions.)

### 4. Deploy

Push to a repo, connect it in Netlify, set the environment variables above,
and deploy — `netlify.toml` already points the build at `dist/` and the
functions at `netlify/functions/`.

## What's ported 1:1 from the Swift app

- `lib/club.js` ← `Club.swift` (canonical IDs, display names, one alias map)
- `lib/conditions.js` ← `ShotTypes.swift` + the wind/elevation math in `Adjustments.swift`
- `lib/clubPicker.js` ← `ClubSelector.swift`
- `lib/adviceEngine.js` ← the advice math from `GolfViewModel.handleAdvice`
- `lib/stats.js` ← `StatsManager.swift`
- `lib/ruleParser.js` ← `ShotParser.swift`

## Known gaps vs. the Swift app

- Voice input uses the browser's Web Speech API, which has weaker
  vocabulary-biasing than `SFSpeechRecognizer`'s `contextualStrings` — no
  golf-specific hint list is possible client-side. Typed input is the
  reliable fallback and is always available.
- Web Speech API support varies (best in Chrome/Edge; Safari is partial,
  Firefox unsupported) — the mic button hides itself when unsupported.
