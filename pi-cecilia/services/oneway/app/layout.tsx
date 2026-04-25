import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'OneWay',
  description: 'OneWay by BlackRoad — one direction, full speed. Focused task execution on BlackRoad OS.',
  metadataBase: new URL('https://oneway.blackroad.io'),
  openGraph: {
    title: 'OneWay — BlackRoad OS',
    description: 'OneWay by BlackRoad — one direction, full speed. Focused task execution on BlackRoad OS.',
    url: 'https://oneway.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'OneWay' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'OneWay — BlackRoad OS',
    description: 'OneWay by BlackRoad — one direction, full speed. Focused task execution on BlackRoad OS.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='OneWay' serviceUrl='https://oneway.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="f79625b7-d051-4339-8753-6a92e0110b45"></script>
</body>
    </html>
  )
}
