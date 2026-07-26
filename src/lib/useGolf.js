import { useCallback, useEffect, useState } from "react";
import {
  ensureSession, loadShots, insertShot, deleteShot, resetAllShots,
  loadSettings, saveSettings
} from "./dataStore.js";
import { buildStats, bagBreakdown } from "./stats.js";
import { recommend } from "./adviceEngine.js";
import { parseShotWithLLM, parseSituationWithLLM } from "./llm.js";
import { parseShotText } from "./ruleParser.js";
import { clubDisplayName } from "./club.js";

export function useGolf() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState("logShot"); // "logShot" | "getAdvice"
  const [shots, setShots] = useState([]);
  const [bag, setBag] = useState([]);
  const [resultText, setResultText] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastShot, setLastShot] = useState(null);
  const [lastSituation, setLastSituation] = useState(null);
  const [settings, setSettingsState] = useState(loadSettings());

  useEffect(() => {
    (async () => {
      await ensureSession();
      const data = await loadShots();
      setShots(data);
      setBag(bagBreakdown(buildStats(data)));
      setReady(true);
    })().catch((err) => setErrorMessage(err.message));
  }, []);

  const refreshFromShots = useCallback((data) => {
    setShots(data);
    setBag(bagBreakdown(buildStats(data)));
  }, []);

  const setSettings = useCallback((next) => {
    setSettingsState(next);
    saveSettings(next);
  }, []);

  const fail = useCallback((message) => {
    setErrorMessage(message);
    setResultText(message);
  }, []);

  const logShot = useCallback(async (shot) => {
    try {
      await insertShot(shot);
      const data = await loadShots();
      refreshFromShots(data);
      setLastShot(data[data.length - 1]);

      setResultText(
        `Shot saved: ${clubDisplayName(shot.club)} at ${shot.swingEffortPercentage ?? 100}%\n` +
        `Carry: ${shot.carryDistanceAchieved ?? "N/A"}\n` +
        `Total: ${shot.totalDistanceAchieved ?? "N/A"}`
      );
    } catch (err) {
      fail(`Couldn't save that shot: ${err.message}`);
    }
  }, [refreshFromShots, fail]);

  const giveAdvice = useCallback((situation) => {
    setLastSituation(situation);
    const rec = recommend(situation, bag);

    if (!rec.best) {
      fail("No clubs logged yet — log a few shots first so there's data to recommend from.");
      return;
    }

    const signed = (v) => (v > 0 ? `+${v}` : `${v}`);

    setResultText(
      `Effective Carry: ${Math.round(rec.adjustedCarryTarget ?? 0)} yds\n` +
      `Effective Total: ${Math.round(rec.adjustedTotalTarget ?? 0)} yds\n\n` +
      `Adjustments:\n` +
      `Elevation: ${signed(rec.elevationAdjustment)}\n` +
      `Wind: ${signed(rec.windAdjustment)}\n` +
      `Lie: ${signed(rec.lieAdjustment)}\n\n` +
      `Recommendation:\n` +
      `${clubDisplayName(rec.best.club)} @ ${rec.best.swing}%\n` +
      `Avg Carry: ~${Math.round(rec.best.carryAvg)} yds (${Math.round(rec.best.carryMin)}–${Math.round(rec.best.carryMax)})\n` +
      `Avg Total: ~${Math.round(rec.best.totalAvg)} yds (${Math.round(rec.best.totalMin)}–${Math.round(rec.best.totalMax)})`
    );
  }, [bag, fail]);

  const processInput = useCallback(async (text) => {
    if (!text?.trim()) return;
    setBusy(true);
    setErrorMessage(null);

    try {
      if (mode === "logShot") {
        if (settings.parsingMode === "rulesOnly") {
          const shot = parseShotText(text);
          if (shot) await logShot(shot);
          else fail(`Couldn't parse that shot. Try: "7iron 80 145 150"`);
          return;
        }
        try {
          const shot = await parseShotWithLLM(text, settings.model);
          await logShot(shot);
          return;
        } catch (err) {
          if (settings.parsingMode === "hybrid") {
            const shot = parseShotText(text);
            if (shot) { await logShot(shot); return; }
          }
          fail(`Couldn't parse that shot: ${err.message}`);
        }
      } else {
        if (settings.parsingMode === "rulesOnly") {
          fail("Rule-based advice parsing isn't implemented yet — switch to Hybrid or LLM mode.");
          return;
        }
        try {
          const situation = await parseSituationWithLLM(text, settings.model);
          giveAdvice(situation);
        } catch (err) {
          fail(`Couldn't parse that situation: ${err.message}`);
        }
      }
    } finally {
      setBusy(false);
    }
  }, [mode, settings, logShot, giveAdvice, fail]);

  const undoLastShot = useCallback(async () => {
    if (!lastShot) return;
    try {
      await deleteShot(lastShot.id);
      const data = await loadShots();
      refreshFromShots(data);
      setLastShot(null);
      setResultText("Last shot undone.");
    } catch (err) {
      fail(`Couldn't undo: ${err.message}`);
    }
  }, [lastShot, refreshFromShots, fail]);

  const resetBag = useCallback(async () => {
    try {
      await resetAllShots();
      refreshFromShots([]);
      setResultText("Bag reset.");
    } catch (err) {
      fail(`Couldn't reset: ${err.message}`);
    }
  }, [refreshFromShots, fail]);

  return {
    ready, mode, setMode, shots, bag, resultText, busy, errorMessage, setErrorMessage,
    lastShot, lastSituation, settings, setSettings,
    processInput, logShot, giveAdvice, undoLastShot, resetBag
  };
}
