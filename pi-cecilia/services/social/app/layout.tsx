import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'BackRoad',
  description: 'BackRoad by BlackRoad — the social layer of BlackRoad OS. Connect, share, and travel together.',
  metadataBase: new URL('https://social.blackroad.io'),
  openGraph: {
    title: 'BackRoad — BlackRoad OS',
    description: 'BackRoad by BlackRoad — the social layer of BlackRoad OS. Connect, share, and travel together.',
    url: 'https://social.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'BackRoad' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'BackRoad — BlackRoad OS',
    description: 'BackRoad by BlackRoad — the social layer of BlackRoad OS. Connect, share, and travel together.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='BackRoad' serviceUrl='https://social.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="7e81bfbc-f115-4218-a7da-0ed551b32c35"></script>
</body>
    </html>
  )
}
