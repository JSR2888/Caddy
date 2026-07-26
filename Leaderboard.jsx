import { clubDisplayName } from "../lib/club.js";

function Rows({ bag }) {
  if (bag.length === 0) {
    return (
      <div className="leaderboard-empty">
        No shots logged yet. Log a few to see your numbers here.
      </div>
    );
  }
  return bag.map((entry, i) => (
    <div className="leaderboard-row" key={`${entry.club}-${entry.swing}`}>
      <span className="leaderboard-pos mono">{String(i + 1).padStart(2, "0")}</span>
      <div className="leaderboard-club">
        <div className="name">{clubDisplayName(entry.club)}</div>
        <div className="swing">{entry.swing}% SWING</div>
      </div>
      <div className="leaderboard-distance">
        <div className="yds">{Math.round(entry.carryAvg)} yds</div>
        <div className="range">
          {Math.round(entry.carryMin)}–{Math.round(entry.carryMax)} carry
        </div>
      </div>
    </div>
  ));
}

export default function Leaderboard({ bag, bare = false }) {
  if (bare) {
    return <div className="leaderboard">{<Rows bag={bag} />}</div>;
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2>Your Leaderboard</h2>
          <span className="count">{bag.length} {bag.length === 1 ? "entry" : "entries"}</span>
        </div>

        <div className="leaderboard">
          <Rows bag={bag} />
        </div>
      </div>
    </section>
  );
}
