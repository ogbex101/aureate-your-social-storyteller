import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to .env.local.");
}

// Untyped client: row shapes are applied explicitly in src/lib/queries.ts
// (no `supabase gen types` access in this environment to generate a
// verified Database generic).
export const supabase = createClient(url, anonKey);
