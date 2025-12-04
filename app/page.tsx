export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>LSD-MCP</h1>
      <p>Dose-Based Cognitive State Modulation Protocol</p>

      <h2>API Endpoints</h2>
      <ul>
        <li><code>GET /api/mcp</code> - Server info</li>
        <li><code>POST /api/mcp</code> - MCP JSON-RPC endpoint</li>
      </ul>

      <h2>Authentication</h2>
      <p>Include your API key in requests:</p>
      <pre>Authorization: Bearer lsd_your_api_key</pre>

      <h2>Documentation</h2>
      <p>
        See the{" "}
        <a href="https://github.com/alexfinnemore/lsd-mcp">GitHub repository</a>{" "}
        for full documentation.
      </p>
    </main>
  );
}
