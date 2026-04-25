import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'CarPool',
  description: 'CarPool by BlackRoad — shared rides, shared rides, shared resources. Collaborative AI experiences.',
  metadataBase: new URL('https://carpool.blackroad.io'),
  openGraph: {
    title: 'CarPool — BlackRoad OS',
    description: 'CarPool by BlackRoad — shared rides, shared rides, shared resources. Collaborative AI experiences.',
    url: 'https://carpool.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'CarPool' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CarPool — BlackRoad OS',
    description: 'CarPool by BlackRoad — shared rides, shared rides, shared resources. Collaborative AI experiences.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='CarPool' serviceUrl='https://carpool.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="7ff789da-dfdc-4e84-849a-e3b5ffdfc694"></script>
</body>
    </html>
  )
}
