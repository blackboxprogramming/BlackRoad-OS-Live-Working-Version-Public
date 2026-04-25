import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "BlackRoad OS",
  description: "The BlackRoad Operating System"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            padding: "1rem 2rem",
            borderBottom: "1px solid #222",
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <div>BlackRoad OS</div>
          <nav style={{ display: "flex", gap: "1rem" }}>
            <a href="/" style={{ textDecoration: "none" }}>Home</a>
            <a href="/docs" style={{ textDecoration: "none" }}>Docs</a>
            <a href="/health" style={{ textDecoration: "none" }}>Health</a>
          </nav>
        </header>
        <main style={{ padding: "2rem" }}>{children}</main>
      </body>
    </html>
  );
}
