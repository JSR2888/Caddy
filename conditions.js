export const SLOPES = [
  { id: "veryUphill", label: "Very Uphill", adjustment: 10 },
  { id: "slightlyUphill", label: "Slightly Uphill", adjustment: 5 },
  { id: "flat", label: "Flat", adjustment: 0 },
  { id: "slightlyDownhill", label: "Slightly Downhill", adjustment: -5 },
  { id: "veryDownhill", label: "Very Downhill", adjustment: -10 }
];

export const WINDS = [
  { id: "strongTailwind", label: "Strong Tailwind", speed: 15, sign: -0.6 },
  { id: "slightTailwind", label: "Slight Tailwind", speed: 7, sign: -0.6 },
  { id: "calm", label: "Calm", speed: 0, sign: 0 },
  { id: "slightHeadwind", label: "Slight Headwind", speed: 7, sign: 1 },
  { id: "strongHeadwind", label: "Strong Headwind", speed: 15, sign: 1 }
];

export const LIES = [
  { id: "tee", label: "Tee", carry: 0, total: 0 },
  { id: "fairway", label: "Fairway", carry: 0, total: 0 },
  { id: "rough", label: "Rough", carry: 4, total: 3 },
  { id: "deepRough", label: "Deep Rough", carry: 9, total: 6 },
  { id: "bunker", label: "Bunker", carry: 7, total: 5 }
];

export const MISS_TYPES = [
  { id: "none", label: "None" },
  { id: "long", label: "Long" },
  { id: "short", label: "Short" }
];

export const bySlopeId = (id) => SLOPES.find((s) => s.id === id) ?? SLOPES[2];
export const byWindId = (id) => WINDS.find((w) => w.id === id) ?? WINDS[2];
export const byLieId = (id) => LIES.find((l) => l.id === id) ?? LIES[1];

/** Higher = more time in air = more wind effect. */
function trajectoryMultiplier(distance) {
  if (distance < 120) return 1.3;
  if (distance < 170) return 1.0;
  if (distance < 210) return 0.9;
  return 0.75;
}

/** Estimated yardage effect of wind on a shot of the given carry distance. */
export function windAdjustment(windId, distance) {
  const wind = byWindId(windId);
  const base = wind.sign * wind.speed * distance / 100;
  return trajectoryMultiplier(distance) * base;
}
