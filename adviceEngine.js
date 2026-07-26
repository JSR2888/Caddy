import { bySlopeId, byLieId, windAdjustment } from "./conditions.js";
import { selectClubs } from "./clubPicker.js";

/**
 * @param {object} situation ShotSituation-shaped object
 * @param {Array} bag array of club summaries: { club, swing, carryAvg, totalAvg, carryMin, carryMax, totalMin, totalMax }
 */
export function recommend(situation, bag) {
  const baseCarry = situation.carryDistanceRequired > 0 ? situation.carryDistanceRequired : null;
  const baseTotal = situation.totalDistanceRequired > 0 ? situation.totalDistanceRequired : null;

  const slope = bySlopeId(situation.slope ?? "flat");
  const elevation = slope.adjustment;

  const effectiveDistanceForWind = baseCarry ?? (baseTotal != null ? baseTotal * 0.8 : null);
  const wind = effectiveDistanceForWind != null
    ? windAdjustment(situation.wind ?? "calm", effectiveDistanceForWind)
    : 0;

  const lie = byLieId(situation.lie ?? "fairway");

  const adjustedCarryTarget = baseCarry != null ? baseCarry + elevation + wind + lie.carry : null;
  const adjustedTotalTarget = baseTotal != null ? baseTotal + elevation + wind + lie.total : null;

  const topClubs = selectClubs(bag, adjustedCarryTarget, adjustedTotalTarget);

  return {
    adjustedCarryTarget,
    adjustedTotalTarget,
    elevationAdjustment: Math.round(elevation),
    windAdjustment: Math.round(wind),
    lieAdjustment: Math.round(lie.carry),
    topClubs,
    best: topClubs[0] ?? null
  };
}
