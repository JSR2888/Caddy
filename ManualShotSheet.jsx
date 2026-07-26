import { useState } from "react";
import { ALL_CLUBS, clubDisplayName } from "../lib/club.js";

export default function ManualShotSheet({ onClose, onSave }) {
  const [club, setClub] = useState("7i");
  const [swing, setSwing] = useState(100);
  const [includeCarry, setIncludeCarry] = useState(true);
  const [carry, setCarry] = useState("");
  const [includeTotal, setIncludeTotal] = useState(false);
  const [total, setTotal] = useState("");

  const handleSave = () => {
    onSave({
      club,
      swingEffortPercentage: Number(swing),
      carryDistanceAchieved: includeCarry && carry !== "" ? Number(carry) : null,
      totalDistanceAchieved: includeTotal && total !== "" ? Number(total) : null
    });
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Manual Shot</h2>
          <button className="icon-btn" style={{ color: "var(--pine-900)", borderColor: "var(--line)" }} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="form-card">
          <div className="form-row">
            <label htmlFor="club-select">Club</label>
            <select id="club-select" value={club} onChange={(e) => setClub(e.target.value)}>
              {ALL_CLUBS.map((id) => (
                <option key={id} value={id}>{clubDisplayName(id)}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="swing-input">Swing Effort %</label>
            <input id="swing-input" type="number" value={swing} onChange={(e) => setSwing(e.target.value)} />
          </div>

          <div className="form-row">
            <div className="toggle-row" style={{ borderTop: "none", paddingTop: 0 }}>
              <label style={{ margin: 0, textTransform: "none", fontWeight: 600, fontSize: "0.85rem" }} htmlFor="carry-toggle">
                Include Carry
              </label>
              <label className="switch">
                <input id="carry-toggle" type="checkbox" checked={includeCarry} onChange={(e) => setIncludeCarry(e.target.checked)} />
                <span className="track" />
              </label>
            </div>
            <input
              type="number"
              value={carry}
              onChange={(e) => setCarry(e.target.value)}
              disabled={!includeCarry}
              style={{ opacity: includeCarry ? 1 : 0.4, marginTop: 8 }}
              placeholder="Carry yards"
            />
          </div>

          <div className="form-row">
            <div className="toggle-row" style={{ borderTop: "none", paddingTop: 0 }}>
              <label style={{ margin: 0, textTransform: "none", fontWeight: 600, fontSize: "0.85rem" }} htmlFor="total-toggle">
                Include Total
              </label>
              <label className="switch">
                <input id="total-toggle" type="checkbox" checked={includeTotal} onChange={(e) => setIncludeTotal(e.target.checked)} />
                <span className="track" />
              </label>
            </div>
            <input
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              disabled={!includeTotal}
              style={{ opacity: includeTotal ? 1 : 0.4, marginTop: 8 }}
              placeholder="Total yards"
            />
          </div>

          <button className="btn-primary" style={{ width: "100%", padding: "12px 0" }} onClick={handleSave}>
            Save Shot
          </button>
        </div>
      </div>
    </div>
  );
}
