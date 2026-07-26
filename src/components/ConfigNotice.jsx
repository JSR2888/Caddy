export default function ConfigNotice() {
  return (
    <div style={{
      minHeight: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "var(--cream)"
    }}>
      <div className="form-card" style={{ maxWidth: 520 }}>
        <h2 style={{ marginBottom: 12 }}>Supabase isn't connected yet</h2>
        <p style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
          <code className="mono">VITE_SUPABASE_URL</code> and{" "}
          <code className="mono">VITE_SUPABASE_ANON_KEY</code> aren't resolving to real
          values in this build.
        </p>
        <p style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
          If you installed the Netlify Supabase extension, open{" "}
          <strong>Project configuration → Environment variables</strong> in the Netlify
          dashboard and check what it actually named things — it's commonly{" "}
          <code className="mono">SUPABASE_URL</code> /{" "}
          <code className="mono">SUPABASE_ANON_KEY</code>, sometimes{" "}
          <code className="mono">SUPABASE_DATABASE_URL</code>. <code className="mono">vite.config.js</code>{" "}
          already maps those onto <code className="mono">VITE_SUPABASE_URL</code> /{" "}
          <code className="mono">VITE_SUPABASE_ANON_KEY</code> at build time — if the
          names don't match what's listed there, either rename the variables in Netlify
          or add the actual names to the fallback list in{" "}
          <code className="mono">vite.config.js</code>.
        </p>
        <p style={{ color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 0 }}>
          For local dev, copy <code className="mono">.env.example</code> to{" "}
          <code className="mono">.env.local</code> and fill in your project's URL and
          anon key directly.
        </p>
      </div>
    </div>
  );
}
