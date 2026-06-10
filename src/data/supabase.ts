// Supabase client. Reads URL + anon key from Vite env vars.
// The anon key is public by design; row-level security on the database
// enforces that each user can only touch their own rows.

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Set them in .env.local (dev) and GitHub Actions secrets (prod).",
  );
}

export const supabase = createClient(url, anonKey);
