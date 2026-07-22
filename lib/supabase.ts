import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (same pattern as the Cyber Mouse reference).
 *
 * Uses the service-role key, which bypasses RLS. Only import this from
 * server components / route handlers / server actions. Never from client
 * components: the key must not ship to the browser. All wiki reads happen
 * server-side during ISR, so this is the only client the site needs.
 */
let _server: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (_server) return _server;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local (or in Vercel project settings).",
    );
  }

  _server = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Give Supabase requests a SHORT fetch-cache window (60s) instead of the
    // route's 1h. Next persists the fetch cache across builds, so without
    // this a rebuild right after a wiki sync bakes hour-old data ("matrix
    // not synced yet" while the rows were live). 60s keeps prerendering
    // legal (no-store would force dynamic rendering and break SSG) while
    // guaranteeing sync -> deploy always picks up fresh rows.
    global: {
      fetch: (input, init) =>
        fetch(input as RequestInfo, {
          ...(init as RequestInit),
          next: { revalidate: 60 },
        } as RequestInit),
    },
  });

  return _server;
}

/** Public URL for an exported icon PNG in the Storage bucket. */
export function iconUrl(fileName: string | null | undefined): string | null {
  if (!fileName) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "icons";
  if (!url) return null;
  return `${url}/storage/v1/object/public/${bucket}/${fileName}`;
}
