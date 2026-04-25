import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export const metadata = {
  title: 'BlackRoad OS App Store',
  description: 'Your own app store - zero gatekeepers',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#FF1D6C',
          colorBackground: '#0a0a0a',
        },
      }}
    >
      <html lang="en">
        <body style={{ margin: 0, padding: 0, background: '#000', color: '#fff', fontFamily: 'system-ui' }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
