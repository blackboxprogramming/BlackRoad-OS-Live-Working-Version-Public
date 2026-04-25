import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'RoadSide',
  description: 'RoadSide by BlackRoad — roadside assistance for the digital journey. Help when you need it.',
  metadataBase: new URL('https://roadside.blackroad.io'),
  openGraph: {
    title: 'RoadSide — BlackRoad OS',
    description: 'RoadSide by BlackRoad — roadside assistance for the digital journey. Help when you need it.',
    url: 'https://roadside.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'RoadSide' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'RoadSide — BlackRoad OS',
    description: 'RoadSide by BlackRoad — roadside assistance for the digital journey. Help when you need it.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='RoadSide' serviceUrl='https://roadside.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="ddb14033-cdad-42e3-bd50-5bc7900021db"></script>
</body>
    </html>
  )
}
