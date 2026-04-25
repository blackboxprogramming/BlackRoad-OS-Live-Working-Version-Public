import type { Metadata } from 'next'
import { BrandNav, BrandFooter } from './_components/blackroad-ui'
import './styles.css'

export const metadata: Metadata = {
  title: 'Roadie',
  description: 'Roadie by BlackRoad — your AI tutor and learning companion. Every learner has a Lucidia.',
  metadataBase: new URL('https://roadie.blackroad.io'),
  openGraph: {
    title: 'Roadie — BlackRoad OS',
    description: 'Roadie by BlackRoad — your AI tutor and learning companion. Every learner has a Lucidia.',
    url: 'https://roadie.blackroad.io',
    siteName: 'BlackRoad OS',
    images: [{ url: 'https://blackroad.io/apple-touch-icon.png', width: 512, height: 512, alt: 'Roadie' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Roadie — BlackRoad OS',
    description: 'Roadie by BlackRoad — your AI tutor and learning companion. Every learner has a Lucidia.',
    images: ['https://blackroad.io/apple-touch-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <div className='grad-bar' />
        <BrandNav serviceName='Roadie' serviceUrl='https://roadie.blackroad.io' />
        <div className='brand-page'>
          {children}
        </div>
        <BrandFooter />
      <script defer src="https://analytics.blackroad.io/road.js" data-website-id="a9488a8a-efaf-43e4-950c-4e18338b3998"></script>
</body>
    </html>
  )
}
