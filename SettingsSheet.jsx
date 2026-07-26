import { useEffect, useState } from "react";
import { loadMetrics, averageLatency } from "../lib/dataStore.js";

const MODELS = [
  { id: "openai/gpt-oss-120b:free", label: "GPT-OSS 120B" },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", label: "Nemotron 3 Nano" },
  { id: "ibm-granite/granite-4.1-8b", label: "IBM Granite 4.1" },
  { id: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { id: "poolside/laguna-xs.2:free", label: "Poolside Laguna XS" }
];

const PARSING_MODES = [
  { id: "llmOnly", label: "LLM Only" },
  { id: "hybrid", label: "Hybrid" },
  { id: "rulesOnly", label: "Rules Only" }
];

export default function SettingsSheet({ settings, setSettings, onClose, onResetData }) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [toast, setToast] = useState(false);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    loadMetrics().then(setMetrics).catch(() => setMetrics([]));
  }, []);

  const models = [...new Set(metrics.map((m) => m.model))].sort();

  const handleReset = async () => {
    await onResetData();
    setConfirmingReset(false);
    setToast(true);
    setTimeout(() => setToast(false), 1500);
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Settings</h2>
          <button className="icon-btn" style={{ color: "var(--pine-900)", borderColor: "var(--line)" }} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="form-card" style={{ marginBottom: 16 }}>
          <div className="form-row">
            <label htmlFor="model-select">LLM Model</label>
            <select
              id="model-select"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="form-row" style={{ marginBottom: 0 }}>
            <label>Parsing Mode</label>
            <div className="pill-group">
              {PARSING_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`pill${settings.parsingMode === m.id ? " active" : ""}`}
                  onClick={() => setSettings({ ...settings, parsingMode: m.id })}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: "1rem", marginBottom: 12 }}>LLM Performance</h3>
          {models.length === 0 ? (
            <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem", margin: 0 }}>No data yet</p>
          ) : (
            models.map((model) => {
              const logAvg = averageLatency(metrics, model, "logShot");
              const adviceAvg = averageLatency(metrics, model, "advice");
              return (
                <div key={model} style={{ padding: "10px 0", borderTop: "1px solid var(--line)" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 4 }}>{model}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--ink-soft)" }}>
                    <span>Log</span>
                    <span className="mono">{logAvg > 0 ? `${Math.round(logAvg)} ms` : "–"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--ink-soft)" }}>
                    <span>Advice</span>
                    <span className="mono">{adviceAvg > 0 ? `${Math.round(adviceAvg)} ms` : "–"}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="form-card">
          <h3 style={{ fontSize: "1rem", marginBottom: 12 }}>Data</h3>
          {!confirmingReset ? (
            <button className="btn-danger-ghost" style={{ width: "100%", padding: "10px 0" }} onClick={() => setConfirmingReset(true)}>
              Clear All Shot Data
            </button>
          ) : (
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: 0 }}>
                This deletes every logged shot. It can't be undone.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmingReset(false)}>Cancel</button>
                <button
                  className="btn-danger-ghost"
                  style={{ flex: 1, borderColor: "var(--wind-in)", background: "var(--wind-in)", color: "var(--cream)" }}
                  onClick={handleReset}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">Data Cleared</div>}
    </div>
  );
}
