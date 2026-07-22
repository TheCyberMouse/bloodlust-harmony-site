export default function RootPage() {
  return (
    <main
      style={{
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        maxWidth: 640,
        margin: "10vh auto",
        padding: "0 1.5rem",
        lineHeight: 1.55,
        color: "#0a0a0a",
      }}
    >
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
        <span style={{ color: "#e10600" }}>Bloodlust & Harmony</span> MCP
      </h1>
      <p style={{ color: "#525252" }}>
        Internal Model Context Protocol server. Nothing to see here â€” talk to
        me through{" "}
        <a
          href="https://cyber-mouse-website.vercel.app/"
          style={{ color: "#0a0a0a" }}
        >
          bloodlust-harmony-site.vercel.app
        </a>
        .
      </p>
      <p style={{ color: "#a3a3a3", fontSize: "0.85rem", marginTop: "2rem" }}>
        Endpoint:{" "}
        <code
          style={{
            background: "#f5f5f5",
            padding: "0.15rem 0.4rem",
            borderRadius: 3,
          }}
        >
          POST /api/mcp
        </code>
      </p>
    </main>
  );
}
