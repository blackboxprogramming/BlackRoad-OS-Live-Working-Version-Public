import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BlackRoad OS – BR‑95 Edition',
  description: 'BlackRoad OS retro desktop rebuilt as modern Next.js components.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
