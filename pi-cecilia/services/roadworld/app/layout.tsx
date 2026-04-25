import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'RoadWorld',
  description: 'RoadWorld by BlackRoad — a sovereign digital world. Explore, build, and connect on BlackRoad OS.',
  metadataBase: new URL('https://roadworld.blackroad.io'),
  openGraph: {
    title: 'RoadWorld — BlackRoad OS',
    description: 'RoadWorld by BlackRoad — a sovereign digital world. Explore, build, and connect on BlackRoad OS.',
    url: 'https://roadworld.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'RoadWorld' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'RoadWorld — BlackRoad OS',
    description: 'RoadWorld by BlackRoad — a sovereign digital world. Explore, build, and connect on BlackRoad OS.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='RoadWorld' serviceUrl='https://roadworld.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="301d7bd7-e8c4-4b7d-8a2c-1892332d8859"></script>
</body>
    </html>
  )
}
