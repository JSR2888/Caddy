import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load ALL env vars (not just VITE_-prefixed ones) so we can read whatever
  // the Netlify Supabase extension actually named things.
  const env = loadEnv(mode, process.cwd(), "");

  // Vite only ever exposes import.meta.env.VITE_* to browser code. The
  // Netlify Supabase extension does NOT use that prefix by default — it's
  // been seen injecting SUPABASE_URL / SUPABASE_DATABASE_URL / SUPABASE_ANON_KEY
  // depending on version and which "framework" you picked during setup.
  // We check every name we've seen it use, in priority order, and bake
  // whichever one exists into VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY at
  // build time — so no manual renaming in the Netlify UI is required.
  const supabaseUrl =
    env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    env.SUPABASE_DATABASE_URL ||
    "";

  const supabaseAnonKey =
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    "";

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey)
    },
    server: {
      proxy: {
        "/.netlify/functions": "http://localhost:9999"
      }
    }
  };
});
