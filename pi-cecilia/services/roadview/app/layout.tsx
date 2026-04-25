import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'RoadView',
  description: 'RoadView by BlackRoad — search and discovery across the BlackRoad OS ecosystem.',
  metadataBase: new URL('https://search.blackroad.io'),
  openGraph: {
    title: 'RoadView — BlackRoad OS',
    description: 'RoadView by BlackRoad — search and discovery across the BlackRoad OS ecosystem.',
    url: 'https://search.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'RoadView' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'RoadView — BlackRoad OS',
    description: 'RoadView by BlackRoad — search and discovery across the BlackRoad OS ecosystem.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='RoadView' serviceUrl='https://search.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="c29527db-a4a1-4398-9a67-c7da8bf0e936"></script>
</body>
    </html>
  )
}
