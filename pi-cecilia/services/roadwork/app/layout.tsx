import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'RoadWork',
  description: 'RoadWork by BlackRoad — the work platform built for the road. Tasks, projects, and progress.',
  metadataBase: new URL('https://roadwork.blackroad.io'),
  openGraph: {
    title: 'RoadWork — BlackRoad OS',
    description: 'RoadWork by BlackRoad — the work platform built for the road. Tasks, projects, and progress.',
    url: 'https://roadwork.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'RoadWork' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'RoadWork — BlackRoad OS',
    description: 'RoadWork by BlackRoad — the work platform built for the road. Tasks, projects, and progress.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='RoadWork' serviceUrl='https://roadwork.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="369bc569-ec1a-4ea0-acd3-931be4c27a5e"></script>
</body>
    </html>
  )
}
