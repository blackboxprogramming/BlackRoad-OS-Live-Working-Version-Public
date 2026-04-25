import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'CarKeys',
  description: 'CarKeys by BlackRoad — access, credentials, and keys for your digital road. Sovereign identity management.',
  metadataBase: new URL('https://carkeys.blackroad.io'),
  openGraph: {
    title: 'CarKeys — BlackRoad OS',
    description: 'CarKeys by BlackRoad — access, credentials, and keys for your digital road. Sovereign identity management.',
    url: 'https://carkeys.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'CarKeys' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CarKeys — BlackRoad OS',
    description: 'CarKeys by BlackRoad — access, credentials, and keys for your digital road. Sovereign identity management.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='CarKeys' serviceUrl='https://carkeys.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="ecf4e087-473d-4f90-b9b5-1f4bffe2ab82"></script>
</body>
    </html>
  )
}
