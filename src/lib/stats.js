/** Rebuilds { [club]: { [swing]: { carrySum, carryCount, carryMin, carryMax, totalSum, totalCount, totalMin, totalMax } } } from raw shots. */
export function buildStats(shots) {
  const stats = {};

  for (const shot of shots) {
    if (!shot.club) continue;
    const swing = shot.swing_effort_percentage ?? shot.swingEffortPercentage ?? 100;

    stats[shot.club] ??= {};
    stats[shot.club][swing] ??= {
      carrySum: 0, carryCount: 0, carryMin: null, carryMax: null,
      totalSum: 0, totalCount: 0, totalMin: null, totalMax: null
    };
    const entry = stats[shot.club][swing];

    const carry = shot.carry_distance_achieved ?? shot.carryDistanceAchieved;
    if (carry != null) {
      entry.carrySum += carry;
      entry.carryCount += 1;
      entry.carryMin = entry.carryMin == null ? carry : Math.min(entry.carryMin, carry);
      entry.carryMax = entry.carryMax == null ? carry : Math.max(entry.carryMax, carry);
    }

    const total = shot.total_distance_achieved ?? shot.totalDistanceAchieved;
    if (total != null) {
      entry.totalSum += total;
      entry.totalCount += 1;
      entry.totalMin = entry.totalMin == null ? total : Math.min(entry.totalMin, total);
      entry.totalMax = entry.totalMax == null ? total : Math.max(entry.totalMax, total);
    }
  }

  return stats;
}

/** Flattened, display-ready list sorted by carry distance descending. */
export function bagBreakdown(stats) {
  const rows = [];
  for (const [club, swings] of Object.entries(stats)) {
    for (const [swing, data] of Object.entries(swings)) {
      rows.push({
        club,
        swing: Number(swing),
        carryAvg: data.carryCount > 0 ? data.carrySum / data.carryCount : 0,
        totalAvg: data.totalCount > 0 ? data.totalSum / data.totalCount : 0,
        carryMin: data.carryMin ?? 0,
        carryMax: data.carryMax ?? 0,
        totalMin: data.totalMin ?? 0,
        totalMax: data.totalMax ?? 0
      });
    }
  }
  return rows.sort((a, b) => b.carryAvg - a.carryAvg);
}
