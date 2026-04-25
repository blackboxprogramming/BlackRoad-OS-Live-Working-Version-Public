import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export const metadata: Metadata = {
  title: 'BlackRoad Operator',
  description: 'Operator control panel for BlackRoad infrastructure management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#764ba2',
          colorBackground: '#1a1a1a',
          colorInputBackground: '#0f0f0f',
          colorInputText: '#e0e0e0',
        },
      }}
    >
      <html lang="en">
        <body style={{
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#0a0a0a',
          color: '#e0e0e0'
        }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
