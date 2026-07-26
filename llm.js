import { normalizeClubId } from "./club.js";
import { saveMetric } from "./dataStore.js";

async function callFunction(name, body) {
  const start = performance.now();
  const res = await fetch(`/.netlify/functions/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const latencyMs = performance.now() - start;
  saveMetric({ model: body.model, requestType: name === "parse-shot" ? "logShot" : "advice", latencyMs });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${name} failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

export async function parseShotWithLLM(text, model) {
  const shot = await callFunction("parse-shot", { text, model });
  if (shot.club) shot.club = normalizeClubId(shot.club);
  return shot;
}

export async function parseSituationWithLLM(text, model) {
  return callFunction("parse-situation", { text, model });
}
