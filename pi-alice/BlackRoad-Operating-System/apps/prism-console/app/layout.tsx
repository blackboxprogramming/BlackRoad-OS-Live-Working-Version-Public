import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "BlackRoad OS – Prism Console",
  description: "Operator console for BlackRoad OS"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside
            style={{
              width: "240px",
              borderRight: "1px solid #222",
              padding: "1rem"
            }}
          >
            <h1 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
              Prism Console
            </h1>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <a href="/" style={{ textDecoration: "none" }}>Dashboard</a>
              <a href="/agents" style={{ textDecoration: "none" }}>Agents</a>
              <a href="/health" style={{ textDecoration: "none" }}>Health</a>
            </nav>
          </aside>
          <main style={{ flex: 1, padding: "1.5rem" }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
