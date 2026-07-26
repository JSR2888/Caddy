export const ALL_CLUBS = [
  "d", "md",
  "3w", "4w", "5w", "6w",
  "2h", "3h", "4h", "5h", "6h", "7h",
  "3i", "4i", "5i", "6i", "7i", "8i", "9i",
  "pw", "gw", "sw", "lw"
];

export const DISPLAY_NAMES = {
  d: "Driver", md: "Mini Driver",
  "3w": "3 Wood", "4w": "4 Wood", "5w": "5 Wood", "6w": "6 Wood",
  "2h": "2 Hybrid", "3h": "3 Hybrid", "4h": "4 Hybrid",
  "5h": "5 Hybrid", "6h": "6 Hybrid", "7h": "7 Hybrid",
  "3i": "3 Iron", "4i": "4 Iron", "5i": "5 Iron",
  "6i": "6 Iron", "7i": "7 Iron", "8i": "8 Iron", "9i": "9 Iron",
  pw: "Pitching Wedge", gw: "Gap Wedge", sw: "Sand Wedge", lw: "Lob Wedge"
};

const EXTRA_ALIASES = {
  driver: "d",
  minidriver: "md", mini: "md",
  "3wood": "3w", "4wood": "4w", "5wood": "5w", "6wood": "6w",
  "2hybrid": "2h", "3hybrid": "3h", "4hybrid": "4h",
  "5hybrid": "5h", "6hybrid": "6h", "7hybrid": "7h",
  "3iron": "3i", "4iron": "4i", "5iron": "5i",
  "6iron": "6i", "7iron": "7i", "8iron": "8i", "9iron": "9i",
  pitchingwedge: "pw", gapwedge: "gw", sandwedge: "sw", lobwedge: "lw",
  "52degree": "gw", "54degree": "sw", "56degree": "sw", "60degree": "lw"
};

const ALIASES = ALL_CLUBS.reduce((map, id) => {
  map[id] = id;
  return map;
}, { ...EXTRA_ALIASES });

/** Normalize free text ("Pitching Wedge", "7-iron") into a canonical club ID. */
export function normalizeClubId(raw) {
  if (!raw) return null;
  const cleaned = raw.toLowerCase().trim().replace(/\s+/g, "").replace(/-/g, "");
  return ALIASES[cleaned] ?? cleaned;
}

export function clubDisplayName(id) {
  if (!id) return "Unknown club";
  return DISPLAY_NAMES[id] ?? id.toUpperCase();
}
