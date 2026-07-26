import { normalizeClubId } from "./club.js";

/**
 * Offline fallback parser for a fixed-order phrase:
 * "7iron 80 145 150 slightlyUphill slightHeadwind"
 * (club, swing%, carry, [total], [slope], [wind])
 */
export function parseShotText(input) {
  const parts = input.toLowerCase().trim().split(/\s+/);
  if (parts.length < 3) return null;

  const swing = parseInt(parts[1], 10);
  const carry = parseInt(parts[2], 10);
  if (Number.isNaN(swing) || Number.isNaN(carry)) return null;

  const total = parts[3] != null ? parseInt(parts[3], 10) : null;

  return {
    club: normalizeClubId(parts[0]),
    swingEffortPercentage: swing,
    carryDistanceAchieved: carry,
    totalDistanceAchieved: Number.isNaN(total) ? null : total,
    slope: parts[4] ?? null,
    wind: parts[5] ?? null
  };
}
