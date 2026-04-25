import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "BlackRoad OS Docs",
  description: "Documentation for BlackRoad Operating System"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside
            style={{
              width: "260px",
              borderRight: "1px solid #222",
              padding: "1rem"
            }}
          >
            <h1 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
              BlackRoad OS Docs
            </h1>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <a href="/" style={{ textDecoration: "none" }}>Overview</a>
              <a href="/getting-started" style={{ textDecoration: "none" }}>Getting Started</a>
              <a href="/health" style={{ textDecoration: "none" }}>Health</a>
            </nav>
          </aside>
          <main style={{ flex: 1, padding: "2rem" }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
