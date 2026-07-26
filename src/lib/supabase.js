import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True only if both values are present and non-empty. Check this before touching `supabase`. */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // Intentionally not throwing here — a thrown error at module scope kills the
  // whole React render before anything mounts, producing a blank page with no
  // clue why. App.jsx checks isSupabaseConfigured and shows a real message instead.
  console.error(
    "Supabase isn't configured: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing. " +
    "If you're using the Netlify Supabase extension, check Project configuration > " +
    "Environment variables for the exact names it created (commonly SUPABASE_URL / " +
    "SUPABASE_ANON_KEY, sometimes SUPABASE_DATABASE_URL) — vite.config.js maps those " +
    "onto VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY at build time automatically."
  );
}

// Fall back to placeholder strings so createClient doesn't throw synchronously;
// isSupabaseConfigured is what actually gates whether the app tries to use it.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key"
);
