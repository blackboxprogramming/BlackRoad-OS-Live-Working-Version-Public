import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'RoadTrip',
  description: 'RoadTrip by BlackRoad — 27 AI agents, one destination. Multi-agent orchestration on BlackRoad OS.',
  metadataBase: new URL('https://roadtrip.blackroad.io'),
  openGraph: {
    title: 'RoadTrip — BlackRoad OS',
    description: 'RoadTrip by BlackRoad — 27 AI agents, one destination. Multi-agent orchestration on BlackRoad OS.',
    url: 'https://roadtrip.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'RoadTrip' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'RoadTrip — BlackRoad OS',
    description: 'RoadTrip by BlackRoad — 27 AI agents, one destination. Multi-agent orchestration on BlackRoad OS.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='RoadTrip' serviceUrl='https://roadtrip.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="a983c643-54db-4fe6-9f75-3b1290750b93"></script>
</body>
    </html>
  )
}
