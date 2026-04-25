import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'OfficeRoad',
  description: 'OfficeRoad by BlackRoad — your sovereign digital office. Work, collaborate, and build on the road.',
  metadataBase: new URL('https://officeroad.blackroad.io'),
  openGraph: {
    title: 'OfficeRoad — BlackRoad OS',
    description: 'OfficeRoad by BlackRoad — your sovereign digital office. Work, collaborate, and build on the road.',
    url: 'https://officeroad.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'OfficeRoad' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'OfficeRoad — BlackRoad OS',
    description: 'OfficeRoad by BlackRoad — your sovereign digital office. Work, collaborate, and build on the road.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='OfficeRoad' serviceUrl='https://officeroad.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="597749ef-9fd5-4123-9810-8fb830390e3a"></script>
</body>
    </html>
  )
}
