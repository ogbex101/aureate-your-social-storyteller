import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

if (!supabaseConfigured) {
  // Never throw here — this module is imported from the root layout, so an
  // unconditional throw would take down every page (including the public
  // landing page) whenever the env vars aren't set, instead of just the
  // Supabase-backed features. Real calls below fail cleanly at request time.
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — Supabase-backed features are disabled until these are set.");
}

// Untyped client: row shapes are applied explicitly in src/lib/queries.ts
// (no `supabase gen types` access in this environment to generate a
// verified Database generic).
export const supabase = createClient(url || "https://misconfigured.invalid", anonKey || "misconfigured");
