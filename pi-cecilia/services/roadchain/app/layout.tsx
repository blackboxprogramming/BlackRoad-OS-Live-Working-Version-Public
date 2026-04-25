import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'RoadChain',
  description: 'RoadChain by BlackRoad — sovereign identity and data chain. Your road, your record, your future.',
  metadataBase: new URL('https://roadchain.blackroad.io'),
  openGraph: {
    title: 'RoadChain — BlackRoad OS',
    description: 'RoadChain by BlackRoad — sovereign identity and data chain. Your road, your record, your future.',
    url: 'https://roadchain.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'RoadChain' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'RoadChain — BlackRoad OS',
    description: 'RoadChain by BlackRoad — sovereign identity and data chain. Your road, your record, your future.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='RoadChain' serviceUrl='https://roadchain.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="d87275e8-768f-40d2-9627-bdee4987a4b0"></script>
</body>
    </html>
  )
}
