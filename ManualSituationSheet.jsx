import { useState } from "react";
import { SLOPES, WINDS, LIES, MISS_TYPES } from "../lib/conditions.js";

export default function ManualSituationSheet({ onClose, onSubmit }) {
  const [carry, setCarry] = useState("");
  const [total, setTotal] = useState("");
  const [slope, setSlope] = useState("flat");
  const [wind, setWind] = useState("calm");
  const [lie, setLie] = useState("fairway");
  const [miss, setMiss] = useState("none");

  const handleSubmit = () => {
    onSubmit({
      carryDistanceRequired: carry !== "" ? Number(carry) : null,
      totalDistanceRequired: total !== "" ? Number(total) : null,
      slope,
      wind,
      lie,
      preferredMiss: miss === "none" ? null : miss
    });
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Manual Advice</h2>
          <button className="icon-btn" style={{ color: "var(--pine-900)", borderColor: "var(--line)" }} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="form-card">
          <div className="form-row">
            <label htmlFor="carry-req">Carry Distance Needed</label>
            <input id="carry-req" type="number" value={carry} onChange={(e) => setCarry(e.target.value)} placeholder="yards" />
          </div>

          <div className="form-row">
            <label htmlFor="total-req">Total Distance Needed</label>
            <input id="total-req" type="number" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="yards" />
          </div>

          <div className="form-row">
            <label>Wind</label>
            <div className="pill-group">
              {WINDS.map((w) => (
                <button key={w.id} type="button" className={`pill${wind === w.id ? " active" : ""}`} onClick={() => setWind(w.id)}>
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>Slope</label>
            <div className="pill-group">
              {SLOPES.map((s) => (
                <button key={s.id} type="button" className={`pill${slope === s.id ? " active" : ""}`} onClick={() => setSlope(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>Lie</label>
            <div className="pill-group">
              {LIES.map((l) => (
                <button key={l.id} type="button" className={`pill${lie === l.id ? " active" : ""}`} onClick={() => setLie(l.id)}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>Preferred Miss</label>
            <div className="pill-group">
              {MISS_TYPES.map((m) => (
                <button key={m.id} type="button" className={`pill${miss === m.id ? " active" : ""}`} onClick={() => setMiss(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary" style={{ width: "100%", padding: "12px 0" }} onClick={handleSubmit}>
            Get Advice
          </button>
        </div>
      </div>
    </div>
  );
}
