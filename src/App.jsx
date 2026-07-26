import { useState } from "react";
import { useGolf } from "./lib/useGolf.js";
import { isSupabaseConfigured } from "./lib/supabase.js";
import Header from "./components/Header.jsx";
import InputDock from "./components/InputDock.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import ManualShotSheet from "./components/ManualShotSheet.jsx";
import ManualSituationSheet from "./components/ManualSituationSheet.jsx";
import SettingsSheet from "./components/SettingsSheet.jsx";
import ConfigNotice from "./components/ConfigNotice.jsx";

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigNotice />;
  }

  return <GolfApp />;
}

function GolfApp() {
  const golf = useGolf();
  const [showBag, setShowBag] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showManualShot, setShowManualShot] = useState(false);
  const [showManualSituation, setShowManualSituation] = useState(false);

  const handleManualEntry = () => {
    if (golf.mode === "logShot") setShowManualShot(true);
    else setShowManualSituation(true);
  };

  return (
    <div className="app-shell">
      <Header onOpenBag={() => setShowBag(true)} onOpenSettings={() => setShowSettings(true)} />

      <InputDock
        mode={golf.mode}
        setMode={golf.setMode}
        resultText={golf.resultText}
        busy={golf.busy}
        onSubmit={golf.processInput}
        onManualEntry={handleManualEntry}
      />

      {(golf.lastShot || golf.lastSituation) && (
        <div className="container" style={{ marginTop: -18, marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-danger-ghost" onClick={golf.undoLastShot}>Undo</button>
            <button className="btn-ghost" onClick={handleManualEntry}>Edit</button>
          </div>
        </div>
      )}

      <Leaderboard bag={golf.bag} />

      <footer className="site-footer">
        Caddy — built for your own numbers, not the pros'.
      </footer>

      {showBag && (
        <div className="sheet-overlay" onClick={() => setShowBag(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ padding: 0, background: "transparent", boxShadow: "none" }}>
            <div style={{ background: "var(--cream)", borderRadius: "20px 20px 0 0", padding: "22px 20px 28px" }}>
              <div className="sheet-head">
                <h2>Your Bag</h2>
                <button className="icon-btn" style={{ color: "var(--pine-900)", borderColor: "var(--line)" }} onClick={() => setShowBag(false)} aria-label="Close">✕</button>
              </div>
              <Leaderboard bag={golf.bag} bare />
            </div>
          </div>
        </div>
      )}

      {showManualShot && (
        <ManualShotSheet
          onClose={() => setShowManualShot(false)}
          onSave={async (shot) => {
            await golf.logShot(shot);
            setShowManualShot(false);
          }}
        />
      )}

      {showManualSituation && (
        <ManualSituationSheet
          onClose={() => setShowManualSituation(false)}
          onSubmit={(situation) => {
            golf.giveAdvice(situation);
            setShowManualSituation(false);
          }}
        />
      )}

      {showSettings && (
        <SettingsSheet
          settings={golf.settings}
          setSettings={golf.setSettings}
          onClose={() => setShowSettings(false)}
          onResetData={golf.resetBag}
        />
      )}

      {golf.errorMessage && (
        <div className="toast" role="alert">
          {golf.errorMessage}
          <button
            onClick={() => golf.setErrorMessage(null)}
            style={{ marginLeft: 12, background: "transparent", border: "none", color: "var(--gold-500)", fontWeight: 700 }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
