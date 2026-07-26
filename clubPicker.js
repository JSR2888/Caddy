function score(club, targetCarry, targetTotal) {
  const hasCarry = targetCarry != null;
  const hasTotal = targetTotal != null;

  if (hasCarry && hasTotal) {
    const carryError = Math.abs(targetCarry - club.carryAvg);
    const totalError = Math.abs(targetTotal - club.totalAvg);
    return carryError * 0.7 + totalError * 0.3;
  }
  if (hasCarry) return Math.abs(targetCarry - club.carryAvg);
  if (hasTotal) return Math.abs(targetTotal - club.totalAvg);
  return Infinity;
}

/** Returns the topN clubs closest to the target(s), best match first. */
export function selectClubs(clubs, targetCarry, targetTotal, topN = 3) {
  return clubs
    .map((club) => ({ club, score: score(club, targetCarry, targetTotal) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, topN)
    .map((entry) => entry.club);
}
