import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'RoadCoin',
  description: 'RoadCoin by BlackRoad — the currency of the road. Sovereign value exchange on BlackRoad OS.',
  metadataBase: new URL('https://roadcoin.blackroad.io'),
  openGraph: {
    title: 'RoadCoin — BlackRoad OS',
    description: 'RoadCoin by BlackRoad — the currency of the road. Sovereign value exchange on BlackRoad OS.',
    url: 'https://roadcoin.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'RoadCoin' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'RoadCoin — BlackRoad OS',
    description: 'RoadCoin by BlackRoad — the currency of the road. Sovereign value exchange on BlackRoad OS.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='RoadCoin' serviceUrl='https://roadcoin.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="7dc80c7d-750b-45cc-b0ce-3cc3003d73fd"></script>
</body>
    </html>
  )
}
