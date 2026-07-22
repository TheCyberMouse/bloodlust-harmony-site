import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

// Daily Supabase keepalive, hit by the Vercel Cron in vercel.json.
// The free tier pauses projects after ~7 idle days; a paused DB makes
// deploys silently serve stale builds while pushes "do nothing". One tiny
// read a day keeps it awake. Machine-independent (runs on Vercel, not a PC).
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { count, error } = await supabaseServer()
      .from("wiki_builds")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({
      ok: true,
      builds: count ?? 0,
      at: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
