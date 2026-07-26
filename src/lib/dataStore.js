import { supabase } from "./supabase.js";

/** Ensures there's a signed-in (anonymous) user so RLS policies scope data per-device/account. */
export async function ensureSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw new Error(
      `Couldn't start an anonymous session (${error.message}). ` +
      `Check that Authentication -> Providers -> Anonymous Sign-Ins is enabled on your Supabase project.`
    );
  }
  return data.session;
}

/** Every write path needs a user id. This re-establishes the session if it's missing
 *  instead of assuming one already exists, and fails with a clear message instead of
 *  a bare null-property crash if it can't. */
async function requireUserId() {
  const session = await ensureSession();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error(
      "No authenticated user. Check that Anonymous Sign-Ins are enabled in " +
      "Supabase (Authentication -> Providers) and that VITE_SUPABASE_URL / " +
      "VITE_SUPABASE_ANON_KEY point at the right project."
    );
  }
  return userId;
}

export async function loadShots() {
  const { data, error } = await supabase
    .from("shots")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertShot(shot) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("shots")
    .insert({
      user_id: userId,
      club: shot.club,
      swing_effort_percentage: shot.swingEffortPercentage ?? null,
      carry_distance_achieved: shot.carryDistanceAchieved ?? null,
      total_distance_achieved: shot.totalDistanceAchieved ?? null,
      slope: shot.slope ?? null,
      wind: shot.wind ?? null
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteShot(id) {
  const { error } = await supabase.from("shots").delete().eq("id", id);
  if (error) throw error;
}

export async function resetAllShots() {
  const userId = await requireUserId();
  const { error } = await supabase.from("shots").delete().eq("user_id", userId);
  if (error) throw error;
}

export async function saveMetric({ model, requestType, latencyMs }) {
  try {
    const userId = await requireUserId();
    const { error } = await supabase.from("llm_metrics").insert({
      user_id: userId,
      model,
      request_type: requestType,
      latency_ms: latencyMs
    });
    if (error) console.warn("Failed to save LLM metric:", error);
  } catch (err) {
    // Metrics are best-effort — never let a logging failure block the actual shot/advice flow.
    console.warn("Failed to save LLM metric:", err.message);
  }
}

export async function loadMetrics() {
  const { data, error } = await supabase.from("llm_metrics").select("*");
  if (error) throw error;
  return data;
}

export function averageLatency(metrics, model, requestType) {
  const matching = metrics.filter((m) => m.model === model && m.request_type === requestType);
  if (matching.length === 0) return 0;
  return matching.reduce((sum, m) => sum + m.latency_ms, 0) / matching.length;
}

// --- Local-only settings (device preference, not synced) ---

const SETTINGS_KEY = "caddy.settings.v1";

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", parsingMode: "hybrid" };
  } catch {
    return { model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", parsingMode: "hybrid" };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
