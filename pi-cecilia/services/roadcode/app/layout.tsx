import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'RoadCode',
  description: 'RoadCode by BlackRoad — developer tools and code experiences built on BlackRoad OS.',
  metadataBase: new URL('https://roadcode.blackroad.io'),
  openGraph: {
    title: 'RoadCode — BlackRoad OS',
    description: 'RoadCode by BlackRoad — developer tools and code experiences built on BlackRoad OS.',
    url: 'https://roadcode.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'RoadCode' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'RoadCode — BlackRoad OS',
    description: 'RoadCode by BlackRoad — developer tools and code experiences built on BlackRoad OS.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='RoadCode' serviceUrl='https://roadcode.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="565bc85d-2020-4071-911e-60a07cd194f1"></script>
</body>
    </html>
  )
}
