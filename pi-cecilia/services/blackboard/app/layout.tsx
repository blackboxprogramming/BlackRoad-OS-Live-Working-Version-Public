import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'BlackBoard',
  description: 'BlackRoad OS BlackBoard — your sovereign workspace. Notes, docs, and ideas that travel with you.',
  metadataBase: new URL('https://blackboard.blackroad.io'),
  openGraph: {
    title: 'BlackBoard — BlackRoad OS',
    description: 'BlackRoad OS BlackBoard — your sovereign workspace. Notes, docs, and ideas that travel with you.',
    url: 'https://blackboard.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'BlackBoard' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'BlackBoard — BlackRoad OS',
    description: 'BlackRoad OS BlackBoard — your sovereign workspace. Notes, docs, and ideas that travel with you.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='BlackBoard' serviceUrl='https://blackboard.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="41a1ebc8-f14d-4aa0-accd-7dbf3ed9dbd9"></script>
</body>
    </html>
  )
}
