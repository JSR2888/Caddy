import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Caddy crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "var(--cream, #f7f3e6)"
        }}>
          <div style={{
            maxWidth: 520,
            background: "var(--paper, #fffdf7)",
            border: "1px solid var(--line, #e3ddc9)",
            borderRadius: 16,
            padding: 20
          }}>
            <h2 style={{ marginBottom: 10 }}>Something broke</h2>
            <p style={{ color: "var(--ink-soft, #4a5c50)" }}>
              {this.state.error.message || "Unknown error — check the browser console for details."}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
