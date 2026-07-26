import { useState } from "react";
import { useSpeech } from "../lib/useSpeech.js";

export default function InputDock({ mode, setMode, resultText, busy, onSubmit, onManualEntry }) {
  const [text, setText] = useState("");
  const { supported, isRecording, start, stop } = useSpeech((transcript) => {
    setText(transcript);
    onSubmit(transcript);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="mode-toggle" role="tablist" aria-label="Mode">
          <button
            role="tab"
            aria-selected={mode === "logShot"}
            className={mode === "logShot" ? "active" : ""}
            onClick={() => setMode("logShot")}
          >
            Log Shot
          </button>
          <button
            role="tab"
            aria-selected={mode === "getAdvice"}
            className={mode === "getAdvice" ? "active" : ""}
            onClick={() => setMode("getAdvice")}
          >
            Get Advice
          </button>
        </div>

        <h1 className="hero-title">
          {mode === "logShot" ? "Tell me how that one flew." : "What are you facing?"}
        </h1>
        <p className="hero-sub">
          {mode === "logShot"
            ? "Speak or type the club, effort, and distance."
            : "Describe the yardage, lie, wind, and slope."}
        </p>

        <div className="input-dock">
          <div className="mic-row">
            {supported ? (
              <button
                className={`mic-btn${isRecording ? " recording" : ""}`}
                onClick={isRecording ? stop : start}
                aria-pressed={isRecording}
                aria-label={isRecording ? "Stop listening" : "Start listening"}
              >
                {isRecording ? "■" : "🎤"}
              </button>
            ) : null}
            <span className="mic-label">
              {!supported
                ? "Voice input isn't supported in this browser — type below instead."
                : isRecording
                ? "Listening… tap to stop."
                : "Tap to speak, or type below."}
            </span>
          </div>

          <form className="text-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={mode === "logShot" ? "e.g. 7 iron, 80 percent, 145 carry" : "e.g. 150 to the pin, into the wind"}
              aria-label="Shot or situation description"
            />
            <button className="btn-primary" type="submit" disabled={busy || !text.trim()}>
              {busy ? "…" : "Send"}
            </button>
          </form>

          <div style={{ marginTop: 10 }}>
            <button className="btn-ghost" onClick={onManualEntry} type="button">
              Enter manually
            </button>
          </div>
        </div>

        <div className="result-placard">
          <div className="eyebrow">Result</div>
          {resultText ? <pre>{resultText}</pre> : <p className="empty">Your shot will appear here…</p>}
        </div>
      </div>
    </section>
  );
}
